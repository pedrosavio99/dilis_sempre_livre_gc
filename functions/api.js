const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// ── DB & Auth config ──────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const JWT_SECRET     = process.env.JWT_SECRET     || 'sempre_livre_secret_mude_em_producao';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PIN      = process.env.ADMIN_PIN      || '1234';

const cors = {
  'Access-Control-Allow-Origin':  process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function ok(body, status = 200) {
  return { statusCode: status, headers: cors, body: JSON.stringify(body) };
}

function err(message, status = 400) {
  return { statusCode: status, headers: cors, body: JSON.stringify({ message }) };
}

function verifyToken(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

// ── LOGIN UNIFICADO ───────────────────────────────────────────────────────────

async function login(event) {
  const { usuario, pin } = JSON.parse(event.body || '{}');
  if (!usuario || !pin) return err('Usuário e PIN são obrigatórios');

  if (usuario === ADMIN_USERNAME && pin === ADMIN_PIN) {
    const token = jwt.sign({ role: 'admin', username: usuario }, JWT_SECRET, { expiresIn: '8h' });
    return ok({ sucesso: true, role: 'admin', token });
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, nome, pin FROM promotores WHERE nome = $1 AND ativo = true',
      [usuario]
    );
    if (!rows.length || rows[0].pin !== pin) {
      return err('Usuário ou PIN inválido', 401);
    }
    const token = jwt.sign(
      { role: 'promotor', promotora: rows[0].nome, id: rows[0].id },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    return ok({ sucesso: true, role: 'promotor', promotora: rows[0].nome, token });
  } finally {
    client.release();
  }
}

// ── PROMOTORES ────────────────────────────────────────────────────────────────

async function getPromotores(event) {
  const user = verifyToken(event);
  if (!user || user.role !== 'admin') return err('Não autorizado', 401);
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, nome, pin, ativo FROM promotores ORDER BY nome'
    );
    return ok(rows);
  } finally { client.release(); }
}

async function criarPromotor(event) {
  const user = verifyToken(event);
  if (!user || user.role !== 'admin') return err('Não autorizado', 401);
  const { nome, pin } = JSON.parse(event.body || '{}');
  if (!nome || !pin) return err('Nome e PIN são obrigatórios');
  if (pin.length < 4) return err('PIN deve ter no mínimo 4 caracteres');
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO promotores (nome, pin)
       VALUES ($1, $2)
       RETURNING id, nome, pin, ativo`,
      [nome.trim(), pin]
    );
    return ok(rows[0], 201);
  } catch (e) {
    if (e.code === '23505') return err('Já existe um promotor com esse nome');
    throw e;
  } finally { client.release(); }
}

async function atualizarPromotor(event) {
  const user = verifyToken(event);
  if (!user || user.role !== 'admin') return err('Não autorizado', 401);
  const { id, nome, pin, ativo } = JSON.parse(event.body || '{}');
  if (!id || !nome) return err('ID e nome são obrigatórios');
  if (pin && pin.length < 4) return err('PIN deve ter no mínimo 4 caracteres');
  const client = await pool.connect();
  try {
    const comPin = pin !== undefined && pin !== null && pin !== '';
    const query = comPin
      ? `UPDATE promotores SET nome = $1, pin = $2, ativo = $3 WHERE id = $4
         RETURNING id, nome, pin, ativo`
      : `UPDATE promotores SET nome = $1, ativo = $2 WHERE id = $3
         RETURNING id, nome, pin, ativo`;
    const values = comPin ? [nome.trim(), pin, ativo, id] : [nome.trim(), ativo, id];
    const { rows } = await client.query(query, values);
    if (!rows.length) return err('Promotor não encontrado', 404);
    return ok(rows[0]);
  } catch (e) {
    if (e.code === '23505') return err('Já existe um promotor com esse nome');
    throw e;
  } finally { client.release(); }
}

async function deletarPromotor(event) {
  const user = verifyToken(event);
  if (!user || user.role !== 'admin') return err('Não autorizado', 401);
  const { id } = JSON.parse(event.body || '{}');
  if (!id) return err('ID é obrigatório');
  const client = await pool.connect();
  try {
    const { rowCount } = await client.query('DELETE FROM promotores WHERE id = $1', [id]);
    if (!rowCount) return err('Promotor não encontrado', 404);
    return ok({ sucesso: true });
  } finally { client.release(); }
}

// ── BRINDES ───────────────────────────────────────────────────────────────────

async function getBrindesDisponiveis() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, nome, quantidade_disponivel AS "quantidadeDisponivel",
              quantidade_inicial AS "quantidadeInicial", ativo
       FROM brindes
       WHERE ativo = true AND quantidade_disponivel > 0
       ORDER BY nome`
    );
    return ok(rows);
  } finally { client.release(); }
}

async function getBrindesAdmin(event) {
  const user = verifyToken(event);
  if (!user) return err('Não autorizado', 401);
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, nome, quantidade_disponivel AS "quantidadeDisponivel",
              quantidade_inicial AS "quantidadeInicial", ativo
       FROM brindes ORDER BY id DESC`
    );
    return ok(rows);
  } finally { client.release(); }
}

async function criarBrinde(event) {
  const user = verifyToken(event);
  if (!user || user.role !== 'admin') return err('Não autorizado', 401);
  const { nome, quantidadeInicial } = JSON.parse(event.body || '{}');
  if (!nome || !quantidadeInicial) return err('Nome e quantidade são obrigatórios');
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO brindes (nome, quantidade_inicial, quantidade_disponivel, ativo)
       VALUES ($1, $2, $2, true)
       RETURNING id, nome, quantidade_disponivel AS "quantidadeDisponivel",
                 quantidade_inicial AS "quantidadeInicial", ativo`,
      [nome, quantidadeInicial]
    );
    return ok(rows[0], 201);
  } finally { client.release(); }
}

async function atualizarBrinde(event) {
  const user = verifyToken(event);
  if (!user || user.role !== 'admin') return err('Não autorizado', 401);
  const { id, nome, quantidadeInicial, ativo } = JSON.parse(event.body || '{}');
  if (!id || !nome) return err('ID e nome são obrigatórios');
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `UPDATE brindes
       SET nome = $1,
           quantidade_inicial = $2,
           quantidade_disponivel = $2 - (quantidade_inicial - quantidade_disponivel),
           ativo = $3
       WHERE id = $4
       RETURNING id, nome, quantidade_disponivel AS "quantidadeDisponivel",
                 quantidade_inicial AS "quantidadeInicial", ativo`,
      [nome, quantidadeInicial, ativo, id]
    );
    if (!rows.length) return err('Brinde não encontrado', 404);
    return ok(rows[0]);
  } finally { client.release(); }
}

async function deletarBrinde(event) {
  const user = verifyToken(event);
  if (!user || user.role !== 'admin') return err('Não autorizado', 401);
  const { id } = JSON.parse(event.body || '{}');
  if (!id) return err('ID é obrigatório');
  const client = await pool.connect();
  try {
    const { rowCount } = await client.query('DELETE FROM brindes WHERE id = $1', [id]);
    if (!rowCount) return err('Brinde não encontrado', 404);
    return ok({ sucesso: true });
  } finally { client.release(); }
}

// ── LEADS ─────────────────────────────────────────────────────────────────────

async function cadastrarLead(event) {
  const { nome, email, telefone, brindeId, aceiteTermos, promotora, cidade, ativacao } =
    JSON.parse(event.body || '{}');

  if (!nome || !email || !telefone || !brindeId)
    return err('Campos obrigatórios ausentes');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const brinde = await client.query(
      'SELECT id, nome, quantidade_disponivel FROM brindes WHERE id = $1 AND ativo = true FOR UPDATE',
      [brindeId]
    );
    if (!brinde.rows.length) { await client.query('ROLLBACK'); return err('Brinde não encontrado', 404); }
    if (brinde.rows[0].quantidade_disponivel <= 0) { await client.query('ROLLBACK'); return err('Brinde sem estoque disponível', 409); }

    await client.query(
      'UPDATE brindes SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = $1',
      [brindeId]
    );

    const { rows } = await client.query(
      `INSERT INTO leads (nome, email, telefone, brinde_id, brinde_nome, aceite_termos, promotora, cidade, ativacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, nome, email, telefone, brinde_nome AS brinde,
                 promotora, cidade, ativacao,
                 TO_CHAR(created_at AT TIME ZONE 'America/Recife', 'DD/MM/YYYY HH24:MI') AS "dataHora"`,
      [nome, email, telefone, brindeId, brinde.rows[0].nome, aceiteTermos, promotora, cidade, ativacao]
    );

    await client.query('COMMIT');
    return ok({ sucesso: true, lead: rows[0] }, 201);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}

async function getLeads(event) {
  const user = verifyToken(event);
  if (!user) return err('Não autorizado', 401);

  const q = event.queryStringParameters || {};
  const conditions = ['1=1'];
  const values = [];

  if (q.cidade)    { values.push(q.cidade);    conditions.push(`l.cidade = $${values.length}`); }
  if (q.promotora) { values.push(q.promotora); conditions.push(`l.promotora = $${values.length}`); }
  if (q.ativacao)  { values.push(q.ativacao);  conditions.push(`l.ativacao = $${values.length}`); }
  if (q.brinde)    { values.push(q.brinde);    conditions.push(`l.brinde_nome = $${values.length}`); }
  if (q.dataInicio) {
    values.push(q.dataInicio);
    conditions.push(`DATE(l.created_at AT TIME ZONE 'America/Recife') >= $${values.length}::date`);
  }
  if (q.dataFim) {
    values.push(q.dataFim);
    conditions.push(`DATE(l.created_at AT TIME ZONE 'America/Recife') <= $${values.length}::date`);
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT l.id,
              TO_CHAR(l.created_at AT TIME ZONE 'America/Recife', 'DD/MM/YYYY HH24:MI') AS "dataHora",
              l.nome, l.email, l.telefone, l.brinde_nome AS brinde,
              l.promotora, l.cidade, l.ativacao
       FROM leads l
       WHERE ${conditions.join(' AND ')}
       ORDER BY l.created_at DESC`,
      values
    );
    return ok(rows);
  } finally { client.release(); }
}

async function getMetricas(event) {
  const user = verifyToken(event);
  if (!user) return err('Não autorizado', 401);
  const client = await pool.connect();
  try {
    const [totalLeads, totalBrindes, distribuicao] = await Promise.all([
      client.query('SELECT COUNT(*) FROM leads'),
      client.query('SELECT COUNT(*) AS total, SUM(CASE WHEN ativo THEN 1 ELSE 0 END) AS ativos FROM brindes'),
      client.query('SELECT brinde_nome AS brinde, COUNT(*) AS total FROM leads GROUP BY brinde_nome'),
    ]);
    const dist = {};
    distribuicao.rows.forEach(r => { dist[r.brinde] = parseInt(r.total); });
    return ok({
      totalDistribuidos: parseInt(totalLeads.rows[0].count),
      totalBrindes:      parseInt(totalBrindes.rows[0].total),
      totalAtivos:       parseInt(totalBrindes.rows[0].ativos),
      distribuicaoPorBrinde: dist,
    });
  } finally { client.release(); }
}

// ── Router ────────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  const path   = (event.path || '').replace(/^.*\/api\/?/, '').replace(/\/$/, '');
  const method = event.httpMethod;

  try {
    if (path === 'login' && method === 'POST') return await login(event);

    if (path === 'promotores' && method === 'GET')    return await getPromotores(event);
    if (path === 'promotores' && method === 'POST')   return await criarPromotor(event);
    if (path === 'promotores' && method === 'PUT')    return await atualizarPromotor(event);
    if (path === 'promotores' && method === 'DELETE') return await deletarPromotor(event);

    if (path === 'brindes' && method === 'GET') {
      const admin = event.queryStringParameters?.admin === 'true';
      return admin ? await getBrindesAdmin(event) : await getBrindesDisponiveis();
    }
    if (path === 'brindes' && method === 'POST')   return await criarBrinde(event);
    if (path === 'brindes' && method === 'PUT')    return await atualizarBrinde(event);
    if (path === 'brindes' && method === 'DELETE') return await deletarBrinde(event);

    if (path === 'leads' && method === 'POST') return await cadastrarLead(event);
    if (path === 'leads' && method === 'GET')  return await getLeads(event);

    if (path === 'metricas' && method === 'GET') return await getMetricas(event);

    return err(`Rota não encontrada: ${method} /${path}`, 404);
  } catch (e) {
    console.error('[API ERROR]', e);
    return err('Erro interno no servidor', 500);
  }
};