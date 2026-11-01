import { masterData } from '../data/masterData'

function cloneRecords(resource)
{
  return masterData[resource].map((record) => ({ ...record }))
}

export function listRecords(resource)
{
  return cloneRecords(resource)
}

export function createRecord(resource, record)
{
  masterData[resource].push({ ...record })
  return { ...record }
}

export function updateRecord(resource, idField, id, record)
{
  const index = masterData[resource].findIndex((item) => item[idField] === id)
  masterData[resource][index] = { ...record }
  return { ...record }
}

export function removeRecord(resource, idField, id)
{
  const index = masterData[resource].findIndex((item) => item[idField] === id)
  const [removed] = masterData[resource].splice(index, 1)
  return { record: removed, index }
}

export function restoreRecord(resource, deletedEntry)
{
  const index = Math.min(deletedEntry.index, masterData[resource].length)
  masterData[resource].splice(index, 0, { ...deletedEntry.record })
  return { ...deletedEntry.record }
}
