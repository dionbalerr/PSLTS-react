import { useMemo, useState } from 'react'
import { masterDataConfig } from '../../config/masterDataConfig'
import { createRecord, listRecords, removeRecord, restoreRecord, updateRecord } from '../../services/masterDataService'
import DataTable from './DataTable'
import DeleteDialog from './DeleteDialog'
import MasterDataDrawer from './MasterDataDrawer'
import SummaryCardRow from './SummaryCardRow'

function MasterDataPage({ resource })
{
  const config = masterDataConfig[resource]
  const [rows, setRows] = useState(() => listRecords(resource))
  const [search, setSearch] = useState('')
  const [drawerRecord, setDrawerRecord] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [recentlyDeleted, setRecentlyDeleted] = useState(null)

  const filteredRows = useMemo(() =>
    {
      const query = search.trim().toLowerCase()
      if (!query)
      {
        return rows
      }
      return rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(query)))
    }, [rows, search])

  function openCreate()
  {
    setDrawerRecord(null)
    setDrawerOpen(true)
  }

  function openEdit(record)
  {
    setDrawerRecord(record)
    setDrawerOpen(true)
  }

  function closeDrawer()
  {
    setDrawerOpen(false)
    setDrawerRecord(null)
  }

  function saveRecord(record)
  {
    const id = drawerRecord?.[config.idField]
    if (id)
    {
      updateRecord(resource, config.idField, id, record)
    }
    else
    {
      createRecord(resource, record)
    }
    setRows(listRecords(resource))
    closeDrawer()
  }

  function confirmDelete()
  {
    const removed = removeRecord(resource, config.idField, deleteRecord[config.idField])
    setRows(listRecords(resource))
    setRecentlyDeleted(removed)
    setDeleteRecord(null)
  }

  function restoreRecentlyDeleted()
  {
    restoreRecord(resource, recentlyDeleted)
    setRows(listRecords(resource))
    setRecentlyDeleted(null)
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MASTER DATA</p>
          <h1>{config.title}</h1>
          <p className="subtitle">{config.description}</p>
        </div>
        <button className="primary-button" onClick={openCreate} type="button">+ Add {config.singular}</button>
      </div>

      <SummaryCardRow count={rows.length} title={config.title} />

      <div className="table-toolbar">
        <label className="table-search"><span>⌕</span><input aria-label={`Search ${config.title}`} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} value={search} /></label>
        <button className="filter-button" onClick={() => setSearch('')} type="button">↻ Refresh</button>
      </div>

      <section className="data-table-panel panel">
        <div className="table-summary"><span>{filteredRows.length} {config.title.toLowerCase()}</span><span>Local mock data</span></div>
        <DataTable columns={config.columns} onDelete={setDeleteRecord} onEdit={openEdit} rows={filteredRows} />
      </section>

      {recentlyDeleted && <div className="restore-banner">{recentlyDeleted.record[config.idField]} deleted. <button onClick={restoreRecentlyDeleted} type="button">Restore</button></div>}
      {drawerOpen && <MasterDataDrawer config={config} key={drawerRecord?.[config.idField] || 'new'} onClose={closeDrawer} onSave={saveRecord} record={drawerRecord} />}
      {deleteRecord && <DeleteDialog config={config} onCancel={() => setDeleteRecord(null)} onConfirm={confirmDelete} record={deleteRecord} />}
    </>
  )
}

export default MasterDataPage
