import { useState, useEffect } from 'react'
import { useEventoConfig } from './hooks/useEventoConfig'
import SetupScreen from './modules/setup/SetupScreen'
import LoginScreen from './modules/login/LoginScreen'
import LeadScreen from './modules/lead/LeadScreen'
import SucessoScreen from './modules/sucesso/SucessoScreen'
import AdminScreen from './modules/admin/AdminScreen'

// Telas possíveis: 'setup' | 'login' | 'lead' | 'sucesso' | 'admin'

export default function App() {
  const { getConfig } = useEventoConfig()
  const [tela, setTela] = useState(null)
  const [ultimoCadastro, setUltimoCadastro] = useState(null)

  useEffect(() => {
    const config = getConfig()
    setTela(config ? 'lead' : 'setup')
  }, [])

  const isAdmin = tela === 'admin'

  if (!tela) return null

  return (
    <div className={`container${isAdmin ? ' container-admin' : ''}`} id="mainContainer" style={isAdmin ? { maxWidth: 1320 } : { maxWidth: 480 }}>
      {tela === 'setup'  && <SetupScreen onIniciar={() => setTela('lead')} onAdmin={() => setTela('login')} />}
      {tela === 'login'  && <LoginScreen onLoginOk={() => setTela('admin')} onVoltar={() => setTela('setup')} />}
      {tela === 'lead'   && <LeadScreen onSucesso={(dados) => { setUltimoCadastro(dados); setTela('sucesso') }} onNovaConfig={() => setTela('setup')} />}
      {tela === 'sucesso' && <SucessoScreen dados={ultimoCadastro} onProximo={() => setTela('lead')} />}
      {tela === 'admin'  && <AdminScreen onLogout={() => setTela('setup')} />}
    </div>
  )
}
