require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Iniciando migração de promotores...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS promotores (
        id         SERIAL PRIMARY KEY,
        nome       TEXT    NOT NULL UNIQUE,
        pin        TEXT    NOT NULL,
        ativo      BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Tabela promotores criada (ou já existia).');

    const { rows: existentes } = await client.query(`
      SELECT DISTINCT promotora
      FROM leads
      WHERE promotora IS NOT NULL AND promotora <> ''
    `);

    let migrados = 0;
    for (const row of existentes) {
      await client.query(`
        INSERT INTO promotores (nome, pin)
        VALUES ($1, '0000')
        ON CONFLICT (nome) DO NOTHING
      `, [row.promotora]);
      migrados++;
    }

    if (migrados > 0) {
      console.log(`${migrados} promotora(s) migrada(s) com PIN padrão "0000".`);
      console.log('ATENÇÃO: atualize os PINs no painel admin antes de usar.');
    }

    console.log('Migração concluída com sucesso!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);