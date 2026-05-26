import { useState, useEffect } from 'react'
import { useToast } from '../../hooks/useToast.jsx'
import {
  getMetricas, getBrindesAdmin, getLeads,
  criarBrinde, atualizarBrinde, deletarBrinde,
  logoutAdmin,
} from '../../services/api'
import MetricsGrid from './MetricsGrid'
import BrindesTable from './BrindesTable'
import LeadsTable from './LeadsTable'
import FiltrosLeads from './FiltrosLeads'
import ModalBrinde from './ModalBrinde'
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
  const [loading, setLoading]               = useState(true)
  const [modalBrinde, setModalBrinde]       = useState(false)
  const [brindeEditando, setBrindeEditando] = useState(null)
  const [confirmDelete, setConfirmDelete]   = useState(null)

  useEffect(() => { carregarTudo() }, [])

  async function carregarTudo() {
    setLoading(true)
    try {
      const [m, b, l] = await Promise.all([getMetricas(), getBrindesAdmin(), getLeads()])
      setMetricas(m); setBrindes(b); setLeads(l); setLeadsFiltrados(l)
    } catch {
      toast.erro('Erro ao carregar dados do painel.')
    } finally {
      setLoading(false)
    }
  }

  function handleChangeFiltro(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }

  async function handleFiltrar() {
    try {
      const resultado = await getLeads(filtros)
      setLeadsFiltrados(resultado)
    } catch {
      toast.erro('Erro ao aplicar filtros.')
    }
  }

  function abrirModalNovo()    { setBrindeEditando(null); setModalBrinde(true) }
  function abrirModalEditar(b) { setBrindeEditando(b);    setModalBrinde(true) }
  function fecharModalBrinde() { setModalBrinde(false);   setBrindeEditando(null) }

  async function handleSalvarBrinde({ id, nome, quantidadeInicial, ativo }) {
    try {
      if (id) await atualizarBrinde(id, { nome, quantidadeInicial, ativo })
      else    await criarBrinde({ nome, quantidadeInicial })
      fecharModalBrinde()
      const [m, b] = await Promise.all([getMetricas(), getBrindesAdmin()])
      setMetricas(m); setBrindes(b)
      toast.sucesso('Brinde salvo com sucesso.')
    } catch (e) {
      toast.erro('Erro ao salvar brinde: ' + e.message)
    }
  }

  async function handleConfirmarDelete() {
    const id = confirmDelete
    setConfirmDelete(null)
    try {
      await deletarBrinde(id)
      const [m, b] = await Promise.all([getMetricas(), getBrindesAdmin()])
      setMetricas(m); setBrindes(b)
      toast.sucesso('Brinde excluído.')
    } catch (e) {
      toast.erro('Erro ao excluir: ' + e.message)
    }
  }

  function handleLogout() {
    logoutAdmin()
    onLogout()
  }

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

      <div className="admin-section">
        <div className="section-title">
          <span>Gerenciar brindes</span>
          <button onClick={abrirModalNovo} className="btn-ghost">+ Novo brinde</button>
        </div>
        {loading
          ? <SkeletonTable colunas={7} linhas={4} />
          : <BrindesTable
              brindes={brindes}
              onEditar={abrirModalEditar}
              onDeletar={(id) => setConfirmDelete(id)}
            />
        }
      </div>

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

      {confirmDelete && (
        <ModalConfirm
          mensagem="Tem certeza que deseja excluir este brinde? Esta ação não pode ser desfeita."
          onConfirmar={handleConfirmarDelete}
          onCancelar={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}
