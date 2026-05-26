import { useState, useEffect } from 'react'
import { login } from '../../services/api'

export default function LoginScreen({ onLoginAdmin, onLoginPromotor }) {
  const [usuario, setUsuario] = useState('')
  const [pin, setPin]         = useState('')
  const [erros, setErros]     = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ultimo = localStorage.getItem('sl_ultimo_usuario')
    const ultimoPin = localStorage.getItem('sl_ultimo_pin')
    if (ultimo)    setUsuario(ultimo)
    if (ultimoPin) setPin(ultimoPin)
  }, [])

  function validar() {
    const e = {}
    if (!usuario.trim()) e.usuario = 'Informe o usuário.'
    if (!pin.trim())     e.pin     = 'Informe o PIN.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleLogin() {
    if (!validar()) return
    setLoading(true)
    setErros({})
    try {
      const { role, promotora } = await login({ usuario: usuario.trim(), pin })
      localStorage.setItem('sl_ultimo_usuario', usuario.trim())
      localStorage.setItem('sl_ultimo_pin', pin)
      if (role === 'admin')    onLoginAdmin()
      if (role === 'promotor') onLoginPromotor({ promotora })
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
      <h1>Entrar</h1>
      <p className="subtitle">Insira suas credenciais para continuar</p>

      {erros.geral && <div className="erro">{erros.geral}</div>}

      <div className="form-group">
        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={e => { setUsuario(e.target.value); setErros(p => ({ ...p, usuario: '' })) }}
          style={inputStyle('usuario')}
          autoCapitalize="none"
        />
        {erros.usuario && <div className="field-error">{erros.usuario}</div>}
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
    </>
  )
}