export default function LeadsTable({ leads }) {
  if (leads.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '24px 12px', fontSize: 14 }}>
        Nenhuma distribuição encontrada
      </div>
    )
  }

  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Participante</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Brinde</th>
            <th>Promotora</th>
            <th>Cidade</th>
            <th>Ativação</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l, i) => (
            <tr key={l.id ?? i}>
              <td>{l.dataHora}</td>
              <td>{l.nome}</td>
              <td>{l.email}</td>
              <td>{l.telefone}</td>
              <td>{l.brinde}</td>
              <td>{l.promotora}</td>
              <td>{l.cidade}</td>
              <td>{l.ativacao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}