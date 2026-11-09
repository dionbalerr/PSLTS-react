import {
  ApiError,
  createRecord,
  deleteRecord,
  listRecords,
  restoreRecord,
  updateRecord,
} from './masterDataApi'

export { ApiError }


export function listDrivers({ search = '', page = 1, pageSize = 25, signal } = {})
{
  return listRecords('drivers', { search, page, pageSize, signal })
}


export function createDriver(record)
{
  return createRecord('drivers', record)
}


export function updateDriver(id, record)
{
  return updateRecord('drivers', id, record)
}


export function deleteDriver(id)
{
  return deleteRecord('drivers', id)
}


export function restoreDriver(id)
{
  return restoreRecord('drivers', id)
}
