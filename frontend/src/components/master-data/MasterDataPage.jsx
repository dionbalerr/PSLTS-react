import React, { useEffect, useMemo, useState } from 'react'
import { masterDataConfig } from '../../config/masterDataConfig'
import { listRecordsAsync, createRecord, listRecords, removeRecord, restoreRecord, updateRecord } from '../../services/masterDataService'
import DataTable from './DataTable'
import DeleteDialog from './DeleteDialog'
import MasterDataDrawer from './MasterDataDrawer'
import SummaryCardRow from './SummaryCardRow'


function MasterDataPage({ resource })
{
  const config = masterDataConfig[resource]
  const usingApi = resource === 'drivers'
  const [rows, setRows] = useState(() => usingApi ? [] : listRecords(resource))
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [totalCount, setTotalCount] = useState(usingApi ? 0 : rows.length)
  const [loading, setLoading] = useState(usingApi)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [error, setError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [drawerError, setDrawerError] = useState(null)
  const [drawerRecord, setDrawerRecord] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [recentlyDeleted, setRecentlyDeleted] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() =>
    {
      if (!usingApi)
      {
        const records = listRecords(resource)
        setRows(records)
        setTotalCount(records.length)
        setPageCount(1)
        setLoading(false)
        setError(null)
        return undefined
      }

      const controller = new AbortController()
      let active = true

      async function loadRows()
      {
        setLoading(true)
        setError(null)
        setRows([])
        setTotalCount(0)
        try
        {
          const result = await listRecordsAsync(resource, {
            page,
            pageSize: 25,
            search,
            signal: controller.signal,
          })
          if (active && !controller.signal.aborted)
          {
            if (result.pagination.total_pages > 0 && page > result.pagination.total_pages)
            {
              setPage(result.pagination.total_pages)
              return
            }
            setRows(result.data)
            setTotalCount(result.pagination.total)
            setPageCount(result.pagination.total_pages)
          }
        }
        catch (loadError)
        {
          if (active && loadError.name !== 'AbortError')
          {
            setRows([])
            setError(loadError)
          }
        }
        finally
        {
          if (active)
          {
            setLoading(false)
          }
        }
      }

      loadRows()
      return () =>
        {
          active = false
          controller.abort()
        }
    }, [page, reloadKey, resource, search, usingApi])

  const filteredRows = useMemo(() =>
    {
      if (usingApi)
      {
        return rows
      }

      const query = search.trim().toLowerCase()
      if (!query)
      {
        return rows
      }
      return rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(query)))
    }, [rows, search, usingApi])

  function openCreate()
  {
    setDrawerError(null)
    setDrawerRecord(null)
    setDrawerOpen(true)
  }

  function openEdit(record)
  {
    setDrawerError(null)
    setDrawerRecord(record)
    setDrawerOpen(true)
  }

  function openDelete(record)
  {
    setDeleteError(null)
    setDeleteRecord(record)
  }

  function closeDrawer()
  {
    setDrawerOpen(false)
    setDrawerRecord(null)
    setDrawerError(null)
  }

  async function saveRecord(record)
  {
    setSaving(true)
    setDrawerError(null)
    try
    {
      const id = drawerRecord?.[config.idField]
      if (id)
      {
        await updateRecord(resource, config.idField, id, record)
      }
      else
      {
        await createRecord(resource, record)
      }

      if (usingApi)
      {
        setPage(1)
        setReloadKey((current) => current + 1)
      }
      else
      {
        setRows(listRecords(resource))
      }
      closeDrawer()
    }
    catch (saveError)
    {
      setDrawerError(saveError)
    }
    finally
    {
      setSaving(false)
    }
  }

  async function confirmDelete()
  {
    setDeleting(true)
    setError(null)
    try
    {
      const removed = await removeRecord(resource, config.idField, deleteRecord[config.idField])
      const deletedEntry = {
        idField: config.idField,
        record: removed.record,
      }
      if (!usingApi)
      {
        deletedEntry.index = removed.index
      }
      setRecentlyDeleted(deletedEntry)
      setDeleteError(null)
      setDeleteRecord(null)
      if (usingApi)
      {
        setReloadKey((current) => current + 1)
      }
      else
      {
        setRows(listRecords(resource))
      }
    }
    catch (deleteError)
    {
      setDeleteError(deleteError)
      setError(deleteError)
    }
    finally
    {
      setDeleting(false)
    }
  }

  async function restoreRecentlyDeleted()
  {
    const entry = recentlyDeleted
    setRestoring(true)
    setError(null)
    try
    {
      await restoreRecord(resource, recentlyDeleted)
      setRecentlyDeleted((current) => current === entry ? null : current)
      if (usingApi)
      {
        setReloadKey((current) => current + 1)
      }
      else
      {
        setRows(listRecords(resource))
      }
    }
    catch (restoreError)
    {
      setError(restoreError)
    }
    finally
    {
      setRestoring(false)
    }
  }

  function refreshRows()
  {
    if (usingApi)
    {
      setReloadKey((current) => current + 1)
    }
    else
    {
      setSearch('')
    }
  }

  const visibleCount = usingApi ? totalCount : filteredRows.length

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

      <SummaryCardRow count={visibleCount} title={config.title} />

      <div className="table-toolbar">
        <label className="table-search"><span>⌕</span><input aria-label={`Search ${config.title}`} onChange={(event) => { setPage(1); setSearch(event.target.value) }} placeholder={`Search ${config.title.toLowerCase()}...`} value={search} /></label>
        <button className="filter-button" onClick={refreshRows} type="button">↻ Refresh</button>
      </div>

      {error && <div className="api-error" role="alert">{error.message}</div>}
      <section className="data-table-panel panel">
        <div className="table-summary"><span>{visibleCount} {config.title.toLowerCase()}</span><span>{usingApi ? 'PostgreSQL API' : 'Local mock data'}</span></div>
        {loading ? <div className="table-empty">Loading...</div> : <DataTable columns={config.columns} onDelete={openDelete} onEdit={openEdit} rows={filteredRows} />}
        {usingApi && pageCount > 1 && <div className="table-pagination"><button className="filter-button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} type="button">Previous</button><span>Page {page} of {pageCount}</span><button className="filter-button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} type="button">Next</button></div>}
      </section>

      {recentlyDeleted && <div className="restore-banner">{recentlyDeleted.record[config.idField]} deleted. {error && error.message} <button disabled={restoring} onClick={restoreRecentlyDeleted} type="button">{restoring ? 'Restoring...' : 'Restore'}</button></div>}
      {drawerOpen && <MasterDataDrawer config={config} error={drawerError} key={drawerRecord?.[config.idField] || 'new'} onClose={closeDrawer} onSave={saveRecord} record={drawerRecord} saving={saving} />}
      {deleteRecord && <DeleteDialog busy={deleting} config={config} error={deleteError} onCancel={() => { setDeleteError(null); setDeleteRecord(null) }} onConfirm={confirmDelete} record={deleteRecord} />}
    </>
  )
}

export default MasterDataPage
