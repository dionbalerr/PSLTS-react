import { useState } from 'react'

const maintenanceItems = [
  { label: 'Drivers', icon: '♙' },
  { label: 'Delivery Sites', icon: '⌖' },
  { label: 'Suppliers', icon: '▤' },
  { label: 'Clients', icon: '♧' },
]

function Sidebar({ activePage, onNavigate })
{
  const [maintenanceOpen, setMaintenanceOpen] = useState(true)

  return (
    <aside className="sidebar collapsed">
      <div className="brand-row">
        <button className="brand" onClick={() => onNavigate('Dashboard')} type="button" aria-label="Go to Dashboard">
          <span className="brand-mark">PS</span>
          <span className="brand-copy"><strong>PS LTS</strong><span>Logistics master data</span></span>
        </button>
      </div>

      <nav aria-label="Main navigation">
        <button
          className={`nav-item maintenance-toggle ${maintenanceItems.some((item) => item.label === activePage) ? 'active-parent' : ''}`}
          onClick={() => setMaintenanceOpen((current) => !current)}
          type="button"
          title="Maintenance"
        >
          <span className="nav-icon">▦</span>
          <span>Maintenance</span>
          <span className="maintenance-chevron">{maintenanceOpen ? '⌃' : '⌄'}</span>
        </button>

        <div className={`subnav ${maintenanceOpen ? 'open' : ''}`}>
          {maintenanceItems.map((item) => (
            <button
              className={`nav-item subnav-item ${activePage === item.label ? 'active' : ''}`}
              key={item.label}
              onClick={() => onNavigate(item.label)}
              type="button"
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" type="button"><span className="nav-icon">⚙</span><span>Settings</span></button>
        <div className="sync-status">
          <span className="sync-icon">↗</span>
          <div><strong>Local preview</strong><span>API not connected</span></div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
