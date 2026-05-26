export default function ModalConfirm({ mensagem, onConfirmar, onCancelar }) {
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onCancelar()}>
      <div className="modal-content">
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Confirmação</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
          {mensagem}
        </p>
        <button onClick={onConfirmar} className="btn-danger">Confirmar</button>
        <button onClick={onCancelar} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  )
}