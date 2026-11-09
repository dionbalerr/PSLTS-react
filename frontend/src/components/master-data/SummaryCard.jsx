import React from 'react'

function SummaryCard({ label, value })
{
  return (
    <article className="summary-card metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

export default SummaryCard
