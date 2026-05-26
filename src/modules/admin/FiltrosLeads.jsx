export default function FiltrosLeads({ leads, filtros, onChange, onFiltrar }) {
  const unique = (key) => [...new Set(leads.map(l => l[key]).filter(Boolean))]

  const campos = [
    { id: 'cidade',    label: 'Cidade',    key: 'cidade' },
    { id: 'promotora', label: 'Promotora', key: 'promotora' },
    { id: 'ativacao',  label: 'Ativação',  key: 'ativacao' },
    { id: 'brinde',    label: 'Brinde',    key: 'brinde' },
  ]

  function limparFiltros() {
    campos.forEach(({ id }) => onChange(id, ''))
    onChange('dataInicio', '')
    onChange('dataFim', '')
  }

  const temFiltroAtivo = Object.values(filtros).some(v => v)

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>

        {campos.map(({ id, label, key }) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 130, flex: '1 1 130px' }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </label>
            <select
              value={filtros[id] || ''}
              onChange={e => onChange(id, e.target.value)}
              style={{ marginBottom: 0, padding: '7px 30px 7px 10px', fontSize: 13 }}
            >
              <option value="">Todos</option>
              {unique(key).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 130, flex: '1 1 130px' }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            De
          </label>
          <input
            type="date"
            value={filtros.dataInicio || ''}
            onChange={e => onChange('dataInicio', e.target.value)}
            style={{ marginBottom: 0, padding: '7px 10px', fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 130, flex: '1 1 130px' }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Até
          </label>
          <input
            type="date"
            value={filtros.dataFim || ''}
            onChange={e => onChange('dataFim', e.target.value)}
            style={{ marginBottom: 0, padding: '7px 10px', fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, alignSelf: 'flex-end' }}>
          <button
            onClick={onFiltrar}
            className="btn-ghost"
            style={{ padding: '7px 16px', fontSize: 13, whiteSpace: 'nowrap' }}
          >
            Filtrar
          </button>
          {temFiltroAtivo && (
            <button
              onClick={() => { limparFiltros(); onFiltrar() }}
              className="btn-secondary"
              style={{ padding: '7px 12px', fontSize: 13, marginTop: 0, whiteSpace: 'nowrap' }}
            >
              Limpar
            </button>
          )}
        </div>

      </div>
    </div>
  )
}