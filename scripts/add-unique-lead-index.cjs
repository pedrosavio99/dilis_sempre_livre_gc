require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * Migration: recria o índice único com a lógica correta.
 * Regra: email + ativacao (jogo) + dia -> BLOQUEADO
 * Remove o índice antigo (brinde_id) se existir e cria o novo (ativacao).
 */
async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Remove índice antigo se existir
    await client.query(`DROP INDEX IF EXISTS uq_lead_email_brinde_dia;`);
    console.log('Índice antigo removido (se existia).');

    // Remove duplicatas pela nova chave (email + ativacao + dia), mantendo o mais antigo
    const { rowCount } = await client.query(`
      DELETE FROM leads
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
                 ROW_NUMBER() OVER (
                   PARTITION BY LOWER(email), ativacao, DATE(created_at AT TIME ZONE 'America/Recife')
                   ORDER BY id ASC
                 ) AS rn
          FROM leads
        ) sub
        WHERE rn > 1
      );
    `);
    console.log(`Duplicatas removidas: ${rowCount} registro(s).`);

    // Cria o novo índice com ativacao
    await client.query(`
      CREATE UNIQUE INDEX uq_lead_email_ativacao_dia
        ON leads (
          LOWER(email),
          ativacao,
          DATE(created_at AT TIME ZONE 'America/Recife')
        );
    `);

    await client.query('COMMIT');
    console.log('Migration aplicada: índice uq_lead_email_ativacao_dia criado com sucesso.');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
