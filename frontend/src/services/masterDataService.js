import { masterData } from '../data/masterData'
import { createDriver, deleteDriver, listDrivers, restoreDriver, updateDriver } from '../api/driversApi'

function cloneRecords(resource)
{
  return masterData[resource].map((record) => ({ ...record }))
}

export function listRecords(resource)
{
  return cloneRecords(resource)
}

export function listRecordsAsync(resource, options)
{
  if (resource === 'drivers')
  {
    return listDrivers(options)
  }

  const records = cloneRecords(resource)
  return Promise.resolve({
    data: records,
    pagination: {
      page: 1,
      page_size: records.length,
      total: records.length,
      total_pages: 1,
    },
  })
}

export function createRecord(resource, record)
{
  if (resource === 'drivers')
  {
    return createDriver(record).then((response) => response.data)
  }

  masterData[resource].push({ ...record })
  return { ...record }
}

export function updateRecord(resource, idField, id, record)
{
  if (resource === 'drivers')
  {
    return updateDriver(id, record).then((response) => response.data)
  }

  const index = masterData[resource].findIndex((item) => item[idField] === id)
  masterData[resource][index] = { ...record }
  return { ...record }
}

export function removeRecord(resource, idField, id)
{
  if (resource === 'drivers')
  {
    return deleteDriver(id).then((response) => ({ record: response.data }))
  }

  const index = masterData[resource].findIndex((item) => item[idField] === id)
  const [removed] = masterData[resource].splice(index, 1)
  return { record: removed, index }
}

export function restoreRecord(resource, deletedEntry)
{
  if (resource === 'drivers')
  {
    return restoreDriver(deletedEntry.record[deletedEntry.idField]).then((response) => response.data)
  }

  const index = Math.min(deletedEntry.index, masterData[resource].length)
  masterData[resource].splice(index, 0, { ...deletedEntry.record })
  return { ...deletedEntry.record }
}
