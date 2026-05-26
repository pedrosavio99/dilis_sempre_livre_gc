export default function BrindesTable({ brindes, onEditar, onDeletar }) {
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Estoque inicial</th>
            <th>Disponível</th>
            <th>Distribuídos</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {brindes.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '24px 12px' }}>
                Nenhum brinde cadastrado
              </td>
            </tr>
          )}
          {brindes.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.nome}</td>
              <td>{b.quantidadeInicial}</td>
              <td>{b.quantidadeDisponivel}</td>
              <td>{b.quantidadeInicial - b.quantidadeDisponivel}</td>
              <td>
                {b.ativo
                  ? <span style={{ color: '#1a7a38', fontWeight: 500, fontSize: 13 }}>Ativo</span>
                  : <span style={{ color: '#c0281f', fontWeight: 500, fontSize: 13 }}>Inativo</span>
                }
              </td>
              <td>
                <button className="btn-small btn-edit" onClick={() => onEditar(b)}>Editar</button>
                <button className="btn-small btn-delete" onClick={() => onDeletar(b.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}