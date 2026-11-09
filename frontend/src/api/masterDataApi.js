const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const RESOURCE_PATHS = {
  drivers: 'drivers',
  deliverySites: 'delivery-sites',
  suppliers: 'suppliers',
  clients: 'clients',
}

const RESOURCE_FIELDS = {
  drivers: ['DRIVER_NO', 'NAME', 'IC_NO', 'LORRY_NO', 'COMISSION', 'BASIC', 'ROAD_TAX', 'INSPECTION'],
  deliverySites: ['SITE_NO', 'ORIGINATE', 'DESTINATE', 'GOODS', 'GROSS_PRC', 'NET_PRC', 'CLIENT_NO'],
  suppliers: ['SUPPLIER_NO', 'NAME', 'TELEPHONE', 'CONTACT', 'GOODS', 'TERMS', 'CURR_BAL'],
  clients: ['CLIENT_NO', 'NAME_CO', 'CONTACT', 'CONTACT_NO', 'ADDRESS_1', 'ADDRESS_2', 'POSTCODE', 'CITY'],
}


export class ApiError extends Error
{
  constructor(response, payload)
  {
    super(payload?.error?.message || 'API request failed.')
    this.name = 'ApiError'
    this.status = response.status
    this.code = payload?.error?.code
    this.fields = payload?.error?.fields || {}
  }
}


async function request(path, options = {})
{
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  let payload = {}
  try
  {
    payload = await response.json()
  }
  catch (error)
  {
    if (error.name === 'AbortError')
    {
      throw error
    }
    throw new ApiError(response, {
      error: {
        code: 'invalid_response',
        message: 'Server returned an invalid response.',
      },
    })
  }
  if (!response.ok)
  {
    throw new ApiError(response, payload)
  }
  return payload
}


function editablePayload(resource, record)
{
  return Object.fromEntries(
    RESOURCE_FIELDS[resource]
      .filter((field) => Object.hasOwn(record, field))
      .map((field) => [field, record[field]]),
  )
}


function resourcePath(resource)
{
  return RESOURCE_PATHS[resource]
}


export function listRecords(resource, { search = '', page = 1, pageSize = 25, signal } = {})
{
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })
  if (search)
  {
    params.set('search', search)
  }
  return request(`/v1/${resourcePath(resource)}?${params}`, { signal })
}


export function createRecord(resource, record)
{
  return request(`/v1/${resourcePath(resource)}`, {
    method: 'POST',
    body: JSON.stringify(editablePayload(resource, record)),
  })
}


export function updateRecord(resource, id, record)
{
  return request(`/v1/${resourcePath(resource)}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(editablePayload(resource, record)),
  })
}


export function deleteRecord(resource, id)
{
  return request(`/v1/${resourcePath(resource)}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}


export function restoreRecord(resource, id)
{
  return request(`/v1/${resourcePath(resource)}/${encodeURIComponent(id)}/restore`, { method: 'POST' })
}
