require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS brindes (
        id                    SERIAL PRIMARY KEY,
        nome                  TEXT    NOT NULL,
        quantidade_inicial    INT     NOT NULL DEFAULT 0,
        quantidade_disponivel INT     NOT NULL DEFAULT 0,
        ativo                 BOOLEAN NOT NULL DEFAULT true,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS leads (
        id            SERIAL PRIMARY KEY,
        nome          TEXT        NOT NULL,
        email         TEXT        NOT NULL,
        telefone      TEXT        NOT NULL,
        brinde_id     INT         REFERENCES brindes(id) ON DELETE SET NULL,
        brinde_nome   TEXT        NOT NULL,
        aceite_termos BOOLEAN     NOT NULL DEFAULT false,
        promotora     TEXT,
        cidade        TEXT,
        ativacao      TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Tabelas criadas com sucesso!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);