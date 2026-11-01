import { useState } from 'react'
import AppLayout from './layouts/AppLayout'
import DriversPage from './components/DriversPage'
import HealthPanel from './components/HealthPanel'
import MetricCard from './components/MetricCard'
import PlaceholderPage from './components/PlaceholderPage'
import RecentEntries from './components/RecentEntries'
import './App.css'

const metrics = [
  { label: 'DRIVERS', value: '128', note: '+4 this month', icon: '♙', tone: 'blue' },
  { label: 'DELIVERY SITES', value: '64', note: '+2 this month', icon: '⌖', tone: 'purple' },
  { label: 'SUPPLIERS', value: '42', note: 'All records healthy', icon: '▤', tone: 'green' },
  { label: 'CLIENTS', value: '86', note: '+6 this month', icon: '♧', tone: 'orange' },
]

function DashboardPage()
{
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">OPERATIONS OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="subtitle">Maintain clean, reliable logistics master data.</p>
        </div>
        <button className="filter-button refresh-button" type="button">↻ Refresh</button>
      </div>

      <section className="metric-grid" aria-label="Master data totals">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="dashboard-grid">
        <RecentEntries />
        <HealthPanel />
      </section>
    </>
  )
}

function App()
{
  const [activePage, setActivePage] = useState('Dashboard')

  function renderPage()
  {
    if (activePage === 'Dashboard')
    {
      return <DashboardPage />
    }
    if (activePage === 'Drivers')
    {
      return <DriversPage />
    }
    return <PlaceholderPage title={activePage} />
  }

  return (
    <AppLayout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </AppLayout>
  )
}

export default App
