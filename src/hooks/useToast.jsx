import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((mensagem, tipo = 'default', duracao = 3500) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, mensagem, tipo }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duracao)
  }, [])

  const toast = {
    info:    (msg) => addToast(msg, 'default'),
    sucesso: (msg) => addToast(msg, 'toast-success'),
    erro:    (msg) => addToast(msg, 'toast-error'),
  }

  function ToastContainer() {
    if (toasts.length === 0) return null
    return (
      <div className="toast-wrapper">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.tipo}`}>{t.mensagem}</div>
        ))}
      </div>
    )
  }

  return { toast, ToastContainer }
}