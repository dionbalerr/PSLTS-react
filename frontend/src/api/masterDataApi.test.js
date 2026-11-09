import { beforeEach, expect, test, vi } from 'vitest'
import { createRecord, deleteRecord, listRecords, restoreRecord, updateRecord } from './masterDataApi'


beforeEach(() =>
  {
    vi.restoreAllMocks()
  })


test('listRecords maps every master-data resource to its API path', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    for (const resource of ['drivers', 'deliverySites', 'suppliers', 'clients'])
    {
      await listRecords(resource)
    }

    expect(fetchMock.mock.calls.map(([url]) => new URL(url, 'http://localhost').pathname)).toEqual([
      '/api/v1/drivers',
      '/api/v1/delivery-sites',
      '/api/v1/suppliers',
      '/api/v1/clients',
    ])
  })


test('createRecord filters metadata from non-Drivers payloads', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { CLIENT_NO: 'CLI-001' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await createRecord('clients', { CLIENT_NO: 'CLI-001', NAME_CO: 'Client', deleted: false })

    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ CLIENT_NO: 'CLI-001', NAME_CO: 'Client' }))
  })


test('mutation helpers use resource paths and methods', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await updateRecord('deliverySites', 'SITE-001', { SITE_NO: 'SITE-001', ORIGINATE: 'A', deleted: false })
    await deleteRecord('suppliers', 'SUP-001')
    await restoreRecord('clients', 'CLI-001')

    expect(fetchMock.mock.calls.map(([url, options]) => [
      new URL(url, 'http://localhost').pathname,
      options.method,
    ])).toEqual([
      ['/api/v1/delivery-sites/SITE-001', 'PATCH'],
      ['/api/v1/suppliers/SUP-001', 'DELETE'],
      ['/api/v1/clients/CLI-001/restore', 'POST'],
    ])
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ SITE_NO: 'SITE-001', ORIGINATE: 'A' })
    expect(fetchMock.mock.calls[1][1].body).toBeUndefined()
    expect(fetchMock.mock.calls[2][1].body).toBeUndefined()
  })
