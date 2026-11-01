const recentEntries = [
  { type: 'Driver', label: 'Driver master data', detail: 'Updated 12 records', time: 'Today, 09:42' },
  { type: 'Site', label: 'Delivery site register', detail: 'Added 4 records', time: 'Yesterday, 16:18' },
  { type: 'Client', label: 'Client data', detail: 'Updated 8 records', time: 'Yesterday, 11:07' },
]

function RecentEntries()
{
  return (
    <article className="panel recent-panel">
      <div className="panel-heading">
        <div><h2>Recent entries</h2><p>Latest master-data activity</p></div>
        <button className="text-button" type="button">View all →</button>
      </div>
      <div className="activity-list">
        {recentEntries.map((entry) => (
          <button className="activity-row" key={entry.label} type="button">
            <span className="entry-badge">{entry.type.slice(0, 2).toUpperCase()}</span>
            <span className="activity-copy"><strong>{entry.label}</strong><span>{entry.detail}</span></span>
            <time>{entry.time}</time>
          </button>
        ))}
      </div>
    </article>
  )
}

export default RecentEntries
