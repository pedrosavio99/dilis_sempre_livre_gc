import { useState } from 'react'

export default function ModalBrinde({ brinde, onSalvar, onFechar }) {
  const [nome, setNome]             = useState(brinde?.nome ?? '')
  const [quantidade, setQuantidade] = useState(brinde?.quantidadeInicial ?? '')
  const [ativo, setAtivo]           = useState(brinde ? String(brinde.ativo) : 'true')
  const [erros, setErros]           = useState({})

  function limparErro(campo) {
    setErros(p => ({ ...p, [campo]: '' }))
  }

  function validar() {
    const e = {}
    if (!nome.trim())                    e.nome      = 'Informe o nome do brinde.'
    if (!quantidade || Number(quantidade) <= 0) e.quantidade = 'Informe uma quantidade válida.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function handleSalvar() {
    if (!validar()) return
    onSalvar({
      id: brinde?.id,
      nome: nome.trim(),
      quantidadeInicial: parseInt(quantidade),
      ativo: ativo === 'true',
    })
  }

  const inputStyle = (campo) =>
    erros[campo] ? { borderColor: 'var(--danger)', marginBottom: 4 } : {}

  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onFechar()}>
      <div className="modal-content">
        <span className="close" onClick={onFechar}>&times;</span>
        <h2>{brinde ? 'Editar brinde' : 'Novo brinde'}</h2>

        <div className="form-group">
          <input
            type="text"
            placeholder="Nome do brinde"
            value={nome}
            onChange={e => { setNome(e.target.value); limparErro('nome') }}
            style={inputStyle('nome')}
          />
          {erros.nome && <div className="field-error">{erros.nome}</div>}
        </div>

        <div className="form-group">
          <input
            type="number"
            placeholder="Quantidade inicial"
            value={quantidade}
            onChange={e => { setQuantidade(e.target.value); limparErro('quantidade') }}
            style={inputStyle('quantidade')}
          />
          {erros.quantidade && <div className="field-error">{erros.quantidade}</div>}
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