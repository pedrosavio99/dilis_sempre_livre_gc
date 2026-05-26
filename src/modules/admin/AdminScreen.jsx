import { useState, useEffect } from 'react'
import { useToast } from '../../hooks/useToast.jsx'
import {
  getMetricas, getBrindesAdmin, getLeads,
  criarBrinde, atualizarBrinde, deletarBrinde,
  getPromotores, criarPromotor, atualizarPromotor, deletarPromotor,
  logout,
} from '../../services/api'
import MetricsGrid from './MetricsGrid'
import BrindesTable from './BrindesTable'
import LeadsTable from './LeadsTable'
import FiltrosLeads from './FiltrosLeads'
import ModalBrinde from './ModalBrinde'
import ModalPromotor from './ModalPromotor'
import ModalConfirm from './ModalConfirm'

function SkeletonMetrics() {
  return (
    <div className="metrics-grid">
      {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-metric" />)}
    </div>
  )
}

function SkeletonTable({ colunas = 7, linhas = 5 }) {
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            {Array(colunas).fill(0).map((_, i) => (
              <th key={i}><div className="skeleton skeleton-text" style={{ width: '60%' }} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(linhas).fill(0).map((_, i) => (
            <tr key={i}>
              {Array(colunas).fill(0).map((_, j) => (
                <td key={j}>
                  <div className="skeleton skeleton-text" style={{ width: j === 0 ? '40%' : '70%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function baixarCSV(leads) {
  const cabecalho = ['Data/Hora', 'Participante', 'E-mail', 'Telefone', 'Brinde', 'Promotora', 'Cidade', 'Ativação']
  const linhas = leads.map(l =>
    [l.dataHora, l.nome, l.email, l.telefone, l.brinde, l.promotora, l.cidade, l.ativacao]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )
  const csv = [cabecalho.join(','), ...linhas].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `distribuicoes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminScreen({ onLogout }) {
  const { toast, ToastContainer } = useToast()

  const [metricas, setMetricas]             = useState(null)
  const [brindes, setBrindes]               = useState([])
  const [leads, setLeads]                   = useState([])
  const [leadsFiltrados, setLeadsFiltrados] = useState([])
  const [filtros, setFiltros]               = useState({})
  const [promotores, setPromotores]         = useState([])
  const [loading, setLoading]               = useState(true)

  const [modalBrinde, setModalBrinde]           = useState(false)
  const [brindeEditando, setBrindeEditando]     = useState(null)
  const [modalPromotor, setModalPromotor]       = useState(false)
  const [promotorEditando, setPromotorEditando] = useState(null)
  const [confirmDelete, setConfirmDelete]       = useState(null)

  useEffect(() => { carregarTudo() }, [])

  async function carregarTudo() {
    setLoading(true)
    try {
      const [m, b, l, p] = await Promise.all([
        getMetricas(), getBrindesAdmin(), getLeads(), getPromotores(),
      ])
      setMetricas(m); setBrindes(b); setLeads(l); setLeadsFiltrados(l); setPromotores(p)
    } catch {
      toast.erro('Erro ao carregar dados do painel.')
    } finally {
      setLoading(false)
    }
  }

  // ── Leads ──
  function handleChangeFiltro(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }
  async function handleFiltrar() {
    try { setLeadsFiltrados(await getLeads(filtros)) }
    catch { toast.erro('Erro ao aplicar filtros.') }
  }

  // ── Brindes ──
  function abrirModalNovoBrinde()    { setBrindeEditando(null); setModalBrinde(true) }
  function abrirModalEditarBrinde(b) { setBrindeEditando(b);    setModalBrinde(true) }
  function fecharModalBrinde()       { setModalBrinde(false);   setBrindeEditando(null) }

  async function handleSalvarBrinde({ id, nome, quantidadeInicial, ativo }) {
    try {
      if (id) await atualizarBrinde(id, { nome, quantidadeInicial, ativo })
      else    await criarBrinde({ nome, quantidadeInicial })
      fecharModalBrinde()
      const [m, b] = await Promise.all([getMetricas(), getBrindesAdmin()])
      setMetricas(m); setBrindes(b)
      toast.sucesso('Brinde salvo com sucesso.')
    } catch (e) { toast.erro('Erro ao salvar brinde: ' + e.message) }
  }

  // ── Promotores ──
  function abrirModalNovoPromotor()    { setPromotorEditando(null); setModalPromotor(true) }
  function abrirModalEditarPromotor(p) { setPromotorEditando(p);    setModalPromotor(true) }
  function fecharModalPromotor()       { setModalPromotor(false);   setPromotorEditando(null) }

  async function handleSalvarPromotor({ id, nome, pin, ativo }) {
    try {
      if (id) await atualizarPromotor(id, { nome, pin, ativo })
      else    await criarPromotor({ nome, pin })
      fecharModalPromotor()
      setPromotores(await getPromotores())
      toast.sucesso('Promotor salvo com sucesso.')
    } catch (e) { toast.erro('Erro ao salvar promotor: ' + e.message) }
  }

  // ── Delete ──
  async function handleConfirmarDelete() {
    const { tipo, id } = confirmDelete
    setConfirmDelete(null)
    try {
      if (tipo === 'brinde') {
        await deletarBrinde(id)
        const [m, b] = await Promise.all([getMetricas(), getBrindesAdmin()])
        setMetricas(m); setBrindes(b)
        toast.sucesso('Brinde excluído.')
      } else {
        await deletarPromotor(id)
        setPromotores(await getPromotores())
        toast.sucesso('Promotor excluído.')
      }
    } catch (e) { toast.erro('Erro ao excluir: ' + e.message) }
  }

  function handleLogout() { logout(); onLogout() }

  const btnAcao = { width: 'auto', padding: '4px 12px', fontSize: 13 }

  return (
    <>
      <ToastContainer />

      <div className="admin-header">
        <div className="admin-title">Painel do administrador</div>
        <button
          onClick={handleLogout}
          className="btn-danger"
          style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}
        >
          Sair
        </button>
      </div>

      {loading ? <SkeletonMetrics /> : <MetricsGrid metricas={metricas} />}

      {/* Promotores */}
      <div className="admin-section">
        <div className="section-title">
          <span>Gerenciar promotores</span>
          <button onClick={abrirModalNovoPromotor} className="btn-ghost">+ Novo promotor</button>
        </div>
        {loading ? <SkeletonTable colunas={4} linhas={3} /> : (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {promotores.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', opacity: .5 }}>Nenhum promotor cadastrado</td></tr>
                )}
                {promotores.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nome}</td>
                    <td>{p.ativo ? 'Ativo' : 'Inativo'}</td>
                    <td>
                      <button
                        className="btn-ghost"
                        style={{ ...btnAcao, marginRight: 6 }}
                        onClick={() => abrirModalEditarPromotor(p)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-danger"
                        style={btnAcao}
                        onClick={() => setConfirmDelete({ tipo: 'promotor', id: p.id })}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Brindes */}
      <div className="admin-section">
        <div className="section-title">
          <span>Gerenciar brindes</span>
          <button onClick={abrirModalNovoBrinde} className="btn-ghost">+ Novo brinde</button>
        </div>
        {loading
          ? <SkeletonTable colunas={7} linhas={4} />
          : <BrindesTable
              brindes={brindes}
              onEditar={abrirModalEditarBrinde}
              onDeletar={(id) => setConfirmDelete({ tipo: 'brinde', id })}
            />
        }
      </div>

      {/* Leads */}
      <div className="admin-section">
        <div className="section-title">
          <span>Distribuições realizadas</span>
          {!loading && leadsFiltrados.length > 0 && (
            <button className="btn-ghost" onClick={() => baixarCSV(leadsFiltrados)}>
              Baixar CSV
            </button>
          )}
        </div>
        {loading
          ? <SkeletonTable colunas={8} linhas={5} />
          : <>
              <FiltrosLeads
                leads={leads}
                filtros={filtros}
                onChange={handleChangeFiltro}
                onFiltrar={handleFiltrar}
              />
              <LeadsTable leads={leadsFiltrados} />
            </>
        }
      </div>

      {modalBrinde && (
        <ModalBrinde
          key={brindeEditando?.id ?? 'novo'}
          brinde={brindeEditando}
          onSalvar={handleSalvarBrinde}
          onFechar={fecharModalBrinde}
        />
      )}

      {modalPromotor && (
        <ModalPromotor
          key={promotorEditando?.id ?? 'novo'}
          promotor={promotorEditando}
          onSalvar={handleSalvarPromotor}
          onFechar={fecharModalPromotor}
        />
      )}

      {confirmDelete && (
        <ModalConfirm
          mensagem={
            confirmDelete.tipo === 'brinde'
              ? 'Tem certeza que deseja excluir este brinde? Esta ação não pode ser desfeita.'
              : 'Tem certeza que deseja excluir este promotor? Esta ação não pode ser desfeita.'
          }
          onConfirmar={handleConfirmarDelete}
          onCancelar={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}