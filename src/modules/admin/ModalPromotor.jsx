import { useState } from 'react'

export default function ModalPromotor({ promotor, onSalvar, onFechar }) {
  const [nome, setNome]   = useState(promotor?.nome ?? '')
  const [pin, setPin]     = useState('')
  const [ativo, setAtivo] = useState(promotor ? String(promotor.ativo) : 'true')
  const [erros, setErros] = useState({})

  function limparErro(campo) {
    setErros(p => ({ ...p, [campo]: '' }))
  }

  function validar() {
    const e = {}
    if (!nome.trim())                        e.nome = 'Informe o nome do promotor.'
    if (!promotor && !pin.trim())            e.pin  = 'Informe o PIN.'
    if (pin && pin.length < 4)               e.pin  = 'PIN deve ter no mínimo 4 caracteres.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function handleSalvar() {
    if (!validar()) return
    onSalvar({
      id: promotor?.id,
      nome: nome.trim(),
      pin: pin || undefined,
      ativo: ativo === 'true',
    })
  }

  const inputStyle = (campo) =>
    erros[campo] ? { borderColor: 'var(--danger)', marginBottom: 4 } : {}

  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onFechar()}>
      <div className="modal-content">
        <span className="close" onClick={onFechar}>&times;</span>
        <h2>{promotor ? 'Editar promotor' : 'Novo promotor'}</h2>

        <div className="form-group">
          <input
            type="text"
            placeholder="Nome do promotor"
            value={nome}
            onChange={e => { setNome(e.target.value); limparErro('nome') }}
            style={inputStyle('nome')}
          />
          {erros.nome && <div className="field-error">{erros.nome}</div>}
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder={promotor ? 'Novo PIN (deixe em branco para manter)' : 'PIN'}
            value={pin}
            onChange={e => { setPin(e.target.value); limparErro('pin') }}
            style={inputStyle('pin')}
          />
          {erros.pin && <div className="field-error">{erros.pin}</div>}
        </div>

        <select value={ativo} onChange={e => setAtivo(e.target.value)}>
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>

        <button onClick={handleSalvar}>Salvar</button>
      </div>
    </div>
  )
}