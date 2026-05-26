import { useState } from 'react'
import { useEventoConfig } from '../../hooks/useEventoConfig'
import { logout } from '../../services/api'

export default function SetupScreen({ promotora, onIniciar, onSair }) {
  const { salvarConfig } = useEventoConfig()
  const [cidade, setCidade]     = useState('')
  const [ativacao, setAtivacao] = useState('')
  const [erros, setErros]       = useState({})
  const [loading, setLoading]   = useState(false)

  function validar() {
    const e = {}
    if (!cidade)   e.cidade   = 'Selecione a cidade.'
    if (!ativacao) e.ativacao = 'Selecione a ativação.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function handleIniciar() {
    if (!validar()) return
    setLoading(true)
    salvarConfig({ promotora, cidade, ativacao })
    onIniciar()
  }

  function handleSair() {
    logout()
    onSair()
  }

  const inputStyle = (campo) =>
    erros[campo] ? { borderColor: 'var(--danger)', marginBottom: 4 } : {}

  return (
    <>
      <div className="header-row">
        <div>
          <h1>Configuração do Evento</h1>
          <p className="subtitle">Olá, <strong>{promotora}</strong>. Configure os dados antes de iniciar.</p>
        </div>
        <button
          onClick={handleSair}
          className="btn-danger"
          style={{ width: 'auto', padding: '8px 16px', fontSize: 13, marginTop: 2 }}
        >
          Sair
        </button>
      </div>

      <div className="form-group">
        <select
          value={cidade}
          onChange={e => { setCidade(e.target.value); setErros(p => ({ ...p, cidade: '' })) }}
          style={inputStyle('cidade')}
        >
          <option value="">Cidade</option>
          <option value="Campina Grande">Campina Grande</option>
          <option value="Caruaru">Caruaru</option>
        </select>
        {erros.cidade && <div className="field-error">{erros.cidade}</div>}
      </div>

      <div className="form-group">
        <select
          value={ativacao}
          onChange={e => { setAtivacao(e.target.value); setErros(p => ({ ...p, ativacao: '' })) }}
          style={inputStyle('ativacao')}
        >
          <option value="">Tipo de ativação</option>
          <option value="Just Dance">Just Dance</option>
          <option value="Desfile">Desfile</option>
        </select>
        {erros.ativacao && <div className="field-error">{erros.ativacao}</div>}
      </div>

      <button onClick={handleIniciar} disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar distribuição'}
      </button>
    </>
  )
}