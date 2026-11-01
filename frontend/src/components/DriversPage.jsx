const drivers = [
  { id: 'DRV-001', name: 'Ahmad Rahman', lorry: 'WXY 1234', status: 'Active', updated: 'Today, 09:42' },
  { id: 'DRV-002', name: 'Siti Aminah', lorry: 'VBC 5678', status: 'Active', updated: 'Yesterday, 16:18' },
  { id: 'DRV-003', name: 'Kumar Raj', lorry: 'JQK 9012', status: 'Review', updated: 'Yesterday, 11:07' },
]

function DriversPage()
{
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MASTER DATA</p>
          <h1>Drivers</h1>
          <p className="subtitle">View and maintain driver records.</p>
        </div>
        <button className="primary-button" type="button">+ Add driver</button>
      </div>

      <div className="table-toolbar">
        <label className="table-search"><span>⌕</span><input aria-label="Search drivers" placeholder="Search drivers..." /></label>
        <button className="filter-button" type="button">Filter</button>
        <button className="filter-button" type="button">↻ Refresh</button>
      </div>

      <section className="data-table-panel panel">
        <div className="table-summary"><span>3 drivers</span><span>Local mock data</span></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Driver ID</th><th>Name</th><th>Lorry No.</th><th>Status</th><th>Last updated</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td><strong>{driver.id}</strong></td>
                  <td>{driver.name}</td>
                  <td>{driver.lorry}</td>
                  <td><span className={`status-pill ${driver.status.toLowerCase()}`}>{driver.status}</span></td>
                  <td className="muted-cell">{driver.updated}</td>
                  <td><button className="row-action" type="button">•••</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default DriversPage
