export default function SucessoScreen({ dados, onProximo }) {
  if (!dados) return null

  const linhas = [
    ['Participante', dados.nome],
    ['E-mail',       dados.email],
    ['Telefone',     dados.telefone],
    ['Brinde',       dados.brinde],
    ['Promotora',    dados.promotora],
    ['Cidade',       dados.cidade],
    ['Ativação',     dados.ativacao],
    ['Data/Hora',    dados.dataHora],
  ].filter(([, valor]) => valor)

  return (
    <>
      <h1>Cadastro realizado</h1>

      <div className="resumo">
        {linhas.map(([label, valor]) => (
          <p key={label}>
            <strong>{label}</strong>
            <span>{valor}</span>
          </p>
        ))}
      </div>

      <button onClick={onProximo} className="btn-secondary">Próximo participante</button>
    </>
  )
}