import React from 'react'
import SummaryCard from './SummaryCard'

function SummaryCardRow({ title, count })
{
  return (
    <section className="summary-card-row" aria-label={`${title} summary`}>
      <SummaryCard label={`Total ${title}`} value={count} />
    </section>
  )
}

export default SummaryCardRow
