/** @vitest-environment jsdom */

import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import MasterDataPage from './MasterDataPage'


function response(payload, ok = true, status = 200)
{
  return {
    ok,
    status,
    json: async () => payload,
  }
}


beforeEach(() =>
  {
    vi.restoreAllMocks()
  })


afterEach(() =>
  {
    cleanup()
    vi.unstubAllGlobals()
  })


test('failed Drivers save keeps drawer values', async () =>
  {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: { code: 'duplicate_driver_no', message: 'Driver ID already exists.' } }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="drivers" />)
    await waitFor(() => expect(screen.getByText('No records found.')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '+ Add driver' }))
    fireEvent.change(screen.getByLabelText('Driver ID'), { target: { value: 'DRV-003' } })
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Duplicate Driver' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.getByText('Driver ID already exists.')).toBeInTheDocument())
    expect(screen.getByLabelText('Driver ID')).toHaveValue('DRV-003')
    expect(screen.getByLabelText('Name')).toHaveValue('Duplicate Driver')
  })


test('non-Drivers resources use the API-backed page', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="suppliers" />)

    await waitFor(() => expect(screen.getByText('PostgreSQL API')).toBeInTheDocument())
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/suppliers')
  })


test('supplier drawer blocks missing required fields', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="suppliers" />)
    await waitFor(() => expect(screen.getByText('No records found.')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '+ Add supplier' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Supplier ID is required.')).toBeInTheDocument()
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })


test('delivery-site drawer validates money precision', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="deliverySites" />)
    await waitFor(() => expect(screen.getByText('No records found.')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '+ Add delivery site' }))
    fireEvent.change(screen.getByLabelText('Site ID'), { target: { value: 'SITE-001' } })
    fireEvent.change(screen.getByLabelText('Originate'), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText('Destinate'), { target: { value: 'B' } })
    fireEvent.change(screen.getByLabelText('Gross Price'), { target: { value: '12.345' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Gross Price allows up to 2 decimal places.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })


test('supplier drawer normalizes phone input to digits', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="suppliers" />)
    await waitFor(() => expect(screen.getByText('No records found.')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '+ Add supplier' }))
    fireEvent.change(screen.getByLabelText('Telephone'), { target: { value: '012-345' } })

    expect(screen.getByLabelText('Telephone')).toHaveValue('012345')
  })


test('client drawer blocks missing company name', async () =>
  {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="clients" />)
    await waitFor(() => expect(screen.getByText('No records found.')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '+ Add client' }))
    fireEvent.change(screen.getByLabelText('Client ID'), { target: { value: 'CLI-001' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Company is required.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })


test('saving disables drawer close until request finishes', async () =>
  {
    let resolveSave
    const savePromise = new Promise((resolve) => { resolveSave = resolve })
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
      })
      .mockReturnValueOnce(savePromise)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], pagination: { total: 0, total_pages: 0 } }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="drivers" />)
    await waitFor(() => expect(screen.getByText('No records found.')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '+ Add driver' }))
    fireEvent.change(screen.getByLabelText('Driver ID'), { target: { value: 'DRV-004' } })
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Busy Driver' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getByText('Add driver')).toBeInTheDocument()

    resolveSave({
      ok: true,
      json: async () => ({ data: { DRIVER_NO: 'DRV-004' } }),
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })


test('delete failure keeps confirmation dialog open', async () =>
  {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ DRIVER_NO: 'DRV-005', NAME: 'Delete Failure' }], pagination: { total: 1, total_pages: 1 } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { code: 'server_error', message: 'Delete failed.' } }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="drivers" />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete DRV-005' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Delete DRV-005' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = await waitFor(() => screen.getByRole('dialog'))
    expect(await within(dialog).findByText('Delete failed.')).toBeInTheDocument()
    expect(within(dialog).getByText('Delete driver?')).toBeInTheDocument()
  })


test('stale Drivers response does not replace newer search results', async () =>
  {
    let resolveInitial
    let resolveSearch
    const initialRequest = new Promise((resolve) => { resolveInitial = resolve })
    const searchRequest = new Promise((resolve) => { resolveSearch = resolve })
    const fetchMock = vi.fn()
      .mockReturnValueOnce(initialRequest)
      .mockReturnValueOnce(searchRequest)
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="drivers" />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    fireEvent.change(screen.getByRole('textbox', { name: 'Search Drivers' }), { target: { value: 'new' } })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    resolveSearch(response({ data: [{ DRIVER_NO: 'NEW-001', NAME: 'New Result' }], pagination: { total: 1, total_pages: 1 } }))

    await waitFor(() => expect(screen.getByText('New Result')).toBeInTheDocument())
    await act(async () =>
      {
        resolveInitial(response({ data: [{ DRIVER_NO: 'OLD-001', NAME: 'Old Result' }], pagination: { total: 1, total_pages: 1 } }))
        await initialRequest
      })
    expect(screen.queryByText('Old Result')).not.toBeInTheDocument()
  })


test('Drivers page clamps to the last page after a page count change', async () =>
  {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: [{ DRIVER_NO: 'DRV-006', NAME: 'Page One' }], pagination: { total: 26, total_pages: 2 } }))
      .mockResolvedValueOnce(response({ data: [], pagination: { total: 1, total_pages: 1 } }))
      .mockResolvedValueOnce(response({ data: [{ DRIVER_NO: 'DRV-006', NAME: 'Page One Final' }], pagination: { total: 1, total_pages: 1 } }))
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="drivers" />)
    await waitFor(() => expect(screen.getByText('Page 1 of 2')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))

    expect(fetchMock.mock.calls[1][0]).toContain('page=2')
    expect(fetchMock.mock.calls[2][0]).toContain('page=1')
    await waitFor(() => expect(screen.getByText('Page One Final')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
  })


test('restore failure keeps the restore banner available', async () =>
  {
    let listCalls = 0
    const fetchMock = vi.fn((url, options = {}) =>
      {
        if (options.method === 'DELETE')
        {
          return Promise.resolve(response({ data: { DRIVER_NO: 'DRV-007', NAME: 'Restore Failure' } }))
        }
        if (url.includes('/restore'))
        {
          return Promise.resolve(response({ error: { code: 'restore_failed', message: 'Restore failed.' } }, false, 500))
        }
        listCalls += 1
        if (listCalls === 1)
        {
          return Promise.resolve(response({ data: [{ DRIVER_NO: 'DRV-007', NAME: 'Restore Failure' }], pagination: { total: 1, total_pages: 1 } }))
        }
        return Promise.resolve(response({ data: [], pagination: { total: 0, total_pages: 0 } }))
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="drivers" />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete DRV-007' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Delete DRV-007' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))

    await waitFor(() => expect(screen.getByText('Restore failed.')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
  })


test('restore button prevents overlapping restore requests', async () =>
  {
    let resolveRestore
    const restoreRequest = new Promise((resolve) => { resolveRestore = resolve })
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: [{ DRIVER_NO: 'DRV-008', NAME: 'Restore Once' }], pagination: { total: 1, total_pages: 1 } }))
      .mockResolvedValueOnce(response({ data: { DRIVER_NO: 'DRV-008', NAME: 'Restore Once' } }))
      .mockResolvedValueOnce(response({ data: [], pagination: { total: 0, total_pages: 0 } }))
      .mockReturnValueOnce(restoreRequest)
      .mockResolvedValueOnce(response({ data: [{ DRIVER_NO: 'DRV-008', NAME: 'Restore Once Restored' }], pagination: { total: 1, total_pages: 1 } }))
    vi.stubGlobal('fetch', fetchMock)

    render(<MasterDataPage resource="drivers" />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete DRV-008' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Delete DRV-008' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const restoreButton = await waitFor(() => screen.getByRole('button', { name: 'Restore' }))
    fireEvent.click(restoreButton)
    fireEvent.click(restoreButton)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Restoring...' })).toBeDisabled())
    expect(fetchMock).toHaveBeenCalledTimes(4)
    resolveRestore(response({ data: { DRIVER_NO: 'DRV-008', NAME: 'Restore Once' } }))
    await waitFor(() => expect(screen.getByText('Restore Once Restored')).toBeInTheDocument())
    expect(screen.queryByText('DRV-008 deleted.')).not.toBeInTheDocument()
  })
