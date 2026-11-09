const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const DRIVER_FIELDS = ['DRIVER_NO', 'NAME', 'IC_NO', 'LORRY_NO', 'COMISSION', 'BASIC', 'ROAD_TAX', 'INSPECTION']


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


function editableDriverPayload(record)
{
  return Object.fromEntries(
    DRIVER_FIELDS
      .filter((field) => Object.hasOwn(record, field))
      .map((field) => [field, record[field]]),
  )
}


export function listDrivers({ search = '', page = 1, pageSize = 25, signal } = {})
{
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })
  if (search)
  {
    params.set('search', search)
  }

  return request(`/v1/drivers?${params}`, { signal })
}


export function createDriver(record)
{
  return request('/v1/drivers', {
    method: 'POST',
    body: JSON.stringify(editableDriverPayload(record)),
  })
}


export function updateDriver(id, record)
{
  return request(`/v1/drivers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(editableDriverPayload(record)),
  })
}


export function deleteDriver(id)
{
  return request(`/v1/drivers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}


export function restoreDriver(id)
{
  return request(`/v1/drivers/${encodeURIComponent(id)}/restore`, {
    method: 'POST',
  })
}
