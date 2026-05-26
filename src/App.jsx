import { useState, useEffect } from 'react'
import { useEventoConfig } from './hooks/useEventoConfig'
import LoginScreen from './modules/login/LoginScreen'
import SetupScreen from './modules/setup/SetupScreen'
import LeadScreen from './modules/lead/LeadScreen'
import SucessoScreen from './modules/sucesso/SucessoScreen'
import AdminScreen from './modules/admin/AdminScreen'

export default function App() {
  const { getConfig, limparConfig } = useEventoConfig()
  const [tela, setTela] = useState(null)
  const [promotora, setPromotora] = useState('')
  const [ultimoCadastro, setUltimoCadastro] = useState(null)

  useEffect(() => {
    const config = getConfig()
    if (config) {
      setPromotora(config.promotora)
      setTela('lead')
    } else {
      setTela('login')
    }
  }, [])

  function handleLoginAdmin() {
    setTela('admin')
  }

  function handleLoginPromotor({ promotora: nome }) {
    setPromotora(nome)
    setTela('setup')
  }

  function handleLogout() {
    limparConfig()
    setPromotora('')
    setTela('login')
  }

  function handleNovaConfig() {
    limparConfig()
    setTela('login')
  }

  const isAdmin = tela === 'admin'

  if (!tela) return null

  return (
    <div
      className={`container${isAdmin ? ' container-admin' : ''}`}
      id="mainContainer"
      style={isAdmin ? { maxWidth: 1320 } : { maxWidth: 480 }}
    >
      {tela === 'login' && (
        <LoginScreen
          onLoginAdmin={handleLoginAdmin}
          onLoginPromotor={handleLoginPromotor}
        />
      )}
      {tela === 'setup' && (
        <SetupScreen
          promotora={promotora}
          onIniciar={() => setTela('lead')}
          onSair={handleLogout}
        />
      )}
      {tela === 'lead' && (
        <LeadScreen
          onSucesso={(dados) => { setUltimoCadastro(dados); setTela('sucesso') }}
          onNovaConfig={handleNovaConfig}
        />
      )}
      {tela === 'sucesso' && (
        <SucessoScreen
          dados={ultimoCadastro}
          onProximo={() => setTela('lead')}
        />
      )}
      {tela === 'admin' && (
        <AdminScreen onLogout={handleLogout} />
      )}
    </div>
  )
}