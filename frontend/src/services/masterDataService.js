import {
  createRecord as createApiRecord,
  deleteRecord as deleteApiRecord,
  listRecords as listApiRecords,
  restoreRecord as restoreApiRecord,
  updateRecord as updateApiRecord,
} from '../api/masterDataApi'

export function listRecordsAsync(resource, options)
{
  return listApiRecords(resource, options)
}

export function createRecord(resource, record)
{
  return createApiRecord(resource, record).then((response) => response.data)
}

export function updateRecord(resource, id, record)
{
  return updateApiRecord(resource, id, record).then((response) => response.data)
}

export function removeRecord(resource, id)
{
  return deleteApiRecord(resource, id).then((response) => ({ record: response.data }))
}

export function restoreRecord(resource, deletedEntry)
{
  return restoreApiRecord(resource, deletedEntry.record[deletedEntry.idField]).then((response) => response.data)
}
