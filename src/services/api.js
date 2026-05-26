const BASE = import.meta.env.VITE_API_URL || '/api'

async function req(path, options = {}) {
  const token = localStorage.getItem('sl_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}/${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) throw new Error(data.message || `Erro ${res.status}`)
  return data
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

export async function login({ usuario, pin }) {
  const data = await req('login', { method: 'POST', body: JSON.stringify({ usuario, pin }) })
  if (data.token) localStorage.setItem('sl_token', data.token)
  return data // { role: 'admin' | 'promotor', promotora?, token }
}

export function logout() {
  localStorage.removeItem('sl_token')
}

// ── PROMOTORES ────────────────────────────────────────────────────────────────

export async function getPromotores() {
  return req('promotores')
}

export async function criarPromotor({ nome, pin }) {
  return req('promotores', { method: 'POST', body: JSON.stringify({ nome, pin }) })
}

export async function atualizarPromotor(id, { nome, pin, ativo }) {
  return req('promotores', { method: 'PUT', body: JSON.stringify({ id, nome, pin, ativo }) })
}

export async function deletarPromotor(id) {
  return req('promotores', { method: 'DELETE', body: JSON.stringify({ id }) })
}

// ── BRINDES ───────────────────────────────────────────────────────────────────

export async function getBrindesDisponiveis() {
  return req('brindes')
}

export async function getBrindesAdmin() {
  return req('brindes?admin=true')
}

export async function criarBrinde({ nome, quantidadeInicial }) {
  return req('brindes', { method: 'POST', body: JSON.stringify({ nome, quantidadeInicial }) })
}

export async function atualizarBrinde(id, { nome, quantidadeInicial, ativo }) {
  return req('brindes', { method: 'PUT', body: JSON.stringify({ id, nome, quantidadeInicial, ativo }) })
}

export async function deletarBrinde(id) {
  return req('brindes', { method: 'DELETE', body: JSON.stringify({ id }) })
}

// ── LEADS ─────────────────────────────────────────────────────────────────────

export async function cadastrarLead(dados) {
  return req('leads', { method: 'POST', body: JSON.stringify(dados) })
}

export async function getLeads(filtros = {}) {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v) })
  const qs = params.toString()
  return req(qs ? `leads?${qs}` : 'leads')
}

// ── MÉTRICAS ──────────────────────────────────────────────────────────────────

export async function getMetricas() {
  return req('metricas')
}

// ── COMPAT (evita quebrar imports antigos) ────────────────────────────────────

export const loginAdmin  = ({ username, pin }) => login({ usuario: username, pin })
export const logoutAdmin = logout