function MetricCard({ label, value, note, icon, tone })
{
  return (
    <article className="metric-card">
      <div className="metric-topline"><span>{label}</span><span className={`metric-icon ${tone}`}>{icon}</span></div>
      <strong>{value}</strong>
      <span className="metric-note">{note}</span>
    </article>
  )
}

export default MetricCard
