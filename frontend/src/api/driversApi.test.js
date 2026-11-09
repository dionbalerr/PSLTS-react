import { beforeEach, expect, test, vi } from 'vitest'
import { createDriver, listDrivers } from './driversApi'


beforeEach(() =>
  {
    vi.restoreAllMocks()
  })


test('createDriver sends editable fields only', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { DRIVER_NO: 'DRV-001' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await createDriver({ DRIVER_NO: 'DRV-001', NAME: 'Marcus', deleted: false })

    const request = fetchMock.mock.calls[0][1]
    expect(JSON.parse(request.body)).toEqual({ DRIVER_NO: 'DRV-001', NAME: 'Marcus' })
  })


test('listDrivers sends server-side search and pagination', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await listDrivers({ search: 'Marcus', page: 2, pageSize: 25 })

    const requestUrl = new URL(fetchMock.mock.calls[0][0], 'http://localhost')
    expect(requestUrl.pathname).toBe('/api/v1/drivers')
    expect(requestUrl.searchParams.get('search')).toBe('Marcus')
    expect(requestUrl.searchParams.get('page')).toBe('2')
    expect(requestUrl.searchParams.get('page_size')).toBe('25')
  })


test('API errors expose backend status and field errors', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: { code: 'duplicate_driver_no', message: 'Driver ID already exists.', fields: {} } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(createDriver({ DRIVER_NO: 'DRV-001', NAME: 'Duplicate' })).rejects.toMatchObject({
      code: 'duplicate_driver_no',
      status: 409,
    })
  })


test('invalid success response becomes an API error', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('invalid JSON') },
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(listDrivers()).rejects.toMatchObject({
      code: 'invalid_response',
      status: 200,
    })
  })
