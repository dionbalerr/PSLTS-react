function HealthPanel()
{
  return (
    <article className="panel health-panel">
      <div className="panel-heading"><div><h2>Data health</h2><p>Current workspace status</p></div><span className="health-dot">●</span></div>
      <div className="health-score"><strong>96%</strong><span>Healthy records</span></div>
      <div className="progress-track"><span /></div>
      <div className="health-summary"><span><i className="green-dot" /> No duplicate IDs</span><span><i className="green-dot" /> No import errors</span></div>
    </article>
  )
}

export default HealthPanel
