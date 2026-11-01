function DeleteDialog({ config, record, onCancel, onConfirm })
{
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section className="confirm-dialog" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <p className="eyebrow">CONFIRM ACTION</p>
        <h2 id="delete-title">Delete {config.singular}?</h2>
        <p>Remove {record[config.idField]} from the active list?</p>
        <div className="drawer-actions">
          <button className="filter-button" onClick={onCancel} type="button">Cancel</button>
          <button className="danger-button" onClick={onConfirm} type="button">Delete</button>
        </div>
      </section>
    </div>
  )
}

export default DeleteDialog
