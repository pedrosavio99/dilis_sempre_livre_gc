const KEY = 'eventoConfig'

export function useEventoConfig() {
  function getConfig() {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return null
      const config = JSON.parse(raw)
      if (config.promotora && config.cidade && config.ativacao) return config
      return null
    } catch {
      return null
    }
  }

  function salvarConfig({ promotora, cidade, ativacao }) {
    localStorage.setItem(KEY, JSON.stringify({
      promotora,
      cidade,
      ativacao,
      dataConfig: new Date().toLocaleString('pt-BR'),
    }))
  }

  function limparConfig() {
    localStorage.removeItem(KEY)
  }

  return { getConfig, salvarConfig, limparConfig }
}