import React from 'react'

function DeleteDialog({ busy, config, error, record, onCancel, onConfirm })
{
  function handleCancel()
  {
    if (!busy)
    {
      onCancel()
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={handleCancel}>
      <section className="confirm-dialog" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <p className="eyebrow">CONFIRM ACTION</p>
        <h2 id="delete-title">Delete {config.singular}?</h2>
        <p>Remove {record[config.idField]} from the active list?</p>
        {error && <div className="form-error-summary" role="alert">{error.message}</div>}
        <div className="drawer-actions">
          <button className="filter-button" disabled={busy} onClick={handleCancel} type="button">Cancel</button>
          <button className="danger-button" disabled={busy} onClick={onConfirm} type="button">{busy ? 'Deleting...' : 'Delete'}</button>
        </div>
      </section>
    </div>
  )
}

export default DeleteDialog
