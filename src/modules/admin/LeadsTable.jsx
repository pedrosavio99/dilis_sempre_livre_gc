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
              <td data-label="Data">{l.dataHora}</td>
              <td data-label="Participante">{l.nome}</td>
              <td data-label="E-mail">{l.email}</td>
              <td data-label="Telefone">{l.telefone}</td>
              <td data-label="Brinde">{l.brinde}</td>
              <td data-label="Promotora">{l.promotora}</td>
              <td data-label="Cidade">{l.cidade}</td>
              <td data-label="Ativação">{l.ativacao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}