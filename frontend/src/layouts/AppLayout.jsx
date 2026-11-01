import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

function AppLayout({ activePage, onNavigate, children })
{
  const [search, setSearch] = useState('')
  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
      />
      <main className="main-content">
        <Topbar search={search} onSearchChange={setSearch} />
        <div className="content-wrap">{children}</div>
      </main>
    </div>
  )
}

export default AppLayout
