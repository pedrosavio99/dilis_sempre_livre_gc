import { useState } from 'react'
import { loginAdmin } from '../../services/api'

export default function LoginScreen({ onLoginOk, onVoltar }) {
  const [username, setUsername] = useState('')
  const [pin, setPin]           = useState('')
  const [erros, setErros]       = useState({})
  const [loading, setLoading]   = useState(false)

  function validar() {
    const e = {}
    if (!username) e.username = 'Informe o usuário.'
    if (!pin)      e.pin      = 'Informe o PIN.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleLogin() {
    if (!validar()) return
    setLoading(true)
    setErros({})
    try {
      await loginAdmin({ username, pin })
      onLoginOk()
    } catch (e) {
      setErros({ geral: e.message })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (campo) =>
    erros[campo] ? { borderColor: 'var(--danger)', marginBottom: 4 } : {}

  return (
    <>
      <h1>Área administrativa</h1>
      <p className="subtitle">Insira suas credenciais para continuar</p>

      {erros.geral && <div className="erro">{erros.geral}</div>}

      <div className="form-group">
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={e => { setUsername(e.target.value); setErros(p => ({ ...p, username: '' })) }}
          style={inputStyle('username')}
        />
        {erros.username && <div className="field-error">{erros.username}</div>}
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={e => { setPin(e.target.value); setErros(p => ({ ...p, pin: '' })) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={inputStyle('pin')}
        />
        {erros.pin && <div className="field-error">{erros.pin}</div>}
      </div>

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Verificando...' : 'Entrar'}
      </button>
      <button onClick={onVoltar} className="btn-secondary" disabled={loading}>
        Voltar
      </button>
    </>
  )
}