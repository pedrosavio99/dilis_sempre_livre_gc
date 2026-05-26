function SkeletonMetricCard() {
  return (
    <div className="metric-card">
      <div className="skeleton skeleton-text" style={{ width: '50%', marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: '35%', height: 20 }} />
    </div>
  )
}

function MetricCard({ icon, label, value, sub, color = 'var(--accent)' }) {
  return (
    <div className="metric-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="metric-label" style={{ marginBottom: 0 }}>{label}</span>
        <span style={{
          fontSize: 14,
          width: 28, height: 28,
          borderRadius: 8,
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </span>
      </div>
      <div>
        <div className="metric-value" style={{ fontSize: 22 }}>{value}</div>
        {sub && (
          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 4, lineHeight: 1.5 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MetricsGrid({ metricas }) {
  if (!metricas) {
    return (
      <div className="metrics-grid">
        {[1,2,3,4].map(i => <SkeletonMetricCard key={i} />)}
      </div>
    )
  }

  const { totalDistribuidos, totalBrindes, totalAtivos, distribuicaoPorBrinde } = metricas
  const totalInativos = totalBrindes - totalAtivos
  const topBrinde = Object.entries(distribuicaoPorBrinde).sort((a, b) => b[1] - a[1])[0]

  const distribuicaoLinhas = Object.entries(distribuicaoPorBrinde)
    .sort((a, b) => b[1] - a[1])
    .map(([nome, qtd]) => (
      <div key={nome} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
          {nome}
        </span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600, flexShrink: 0, fontSize: 12 }}>{qtd}</span>
      </div>
    ))

  return (
    <div className="metrics-grid">
      <MetricCard
        icon="🎁"
        label="Total distribuído"
        value={totalDistribuidos}
        sub={totalDistribuidos === 0 ? 'Nenhuma distribuição ainda' : `${totalDistribuidos} brinde${totalDistribuidos > 1 ? 's' : ''} entregue${totalDistribuidos > 1 ? 's' : ''}`}
        color="var(--accent)"
      />

      <MetricCard
        icon="📦"
        label="Brindes cadastrados"
        value={totalBrindes}
        sub={totalBrindes === 0 ? 'Nenhum brinde cadastrado' : `${totalAtivos} ativo${totalAtivos !== 1 ? 's' : ''}${totalInativos > 0 ? ` · ${totalInativos} inativo${totalInativos !== 1 ? 's' : ''}` : ''}`}
        color="#34c759"
      />

      <MetricCard
        icon="🏆"
        label="Mais distribuído"
        value={topBrinde ? topBrinde[1] : '—'}
        sub={topBrinde ? topBrinde[0] : 'Nenhuma distribuição ainda'}
        color="#ff9500"
      />

      <div className="metric-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="metric-label" style={{ marginBottom: 0 }}>Por brinde</span>
          <span style={{
            fontSize: 14, width: 28, height: 28, borderRadius: 8,
            background: '#af52de18',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>📊</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {distribuicaoLinhas.length > 0
            ? distribuicaoLinhas
            : <span style={{ color: 'var(--text-tertiary)', fontSize: 11.5 }}>Nenhuma distribuição ainda</span>
          }
        </div>
      </div>
    </div>
  )
}