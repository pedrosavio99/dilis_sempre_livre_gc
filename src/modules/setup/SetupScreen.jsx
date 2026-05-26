import { useState } from 'react'
import { useEventoConfig } from '../../hooks/useEventoConfig'

export default function SetupScreen({ onIniciar, onAdmin }) {
  const { salvarConfig } = useEventoConfig()
  const [promotora, setPromotora] = useState('')
  const [cidade, setCidade]       = useState('')
  const [ativacao, setAtivacao]   = useState('')
  const [erros, setErros]         = useState({})
  const [loading, setLoading]     = useState(false)

  function validar() {
    const e = {}
    if (!promotora.trim()) e.promotora = 'Informe o nome da promotora.'
    if (!cidade)           e.cidade    = 'Selecione a cidade.'
    if (!ativacao)         e.ativacao  = 'Selecione a ativação.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function handleIniciar() {
    if (!validar()) return
    setLoading(true)
    salvarConfig({ promotora: promotora.trim(), cidade, ativacao })
    onIniciar()
  }

  const inputStyle = (campo) =>
    erros[campo] ? { borderColor: 'var(--danger)', marginBottom: 4 } : {}

  return (
    <>
      <div className="header-row">
        <div>
          <h1>Configuração do Evento</h1>
          <p className="subtitle">Configure os dados da promotora antes de iniciar</p>
        </div>
        <button
          onClick={onAdmin}
          style={{ width: 'auto', padding: '8px 16px', fontSize: 13, marginTop: 2 }}
        >
          Admin
        </button>
      </div>

      <div className="form-group">
        <input
          type="text"
          placeholder="Nome da promotora"
          value={promotora}
          onChange={e => { setPromotora(e.target.value); setErros(p => ({ ...p, promotora: '' })) }}
          style={inputStyle('promotora')}
        />
        {erros.promotora && <div className="field-error">{erros.promotora}</div>}
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