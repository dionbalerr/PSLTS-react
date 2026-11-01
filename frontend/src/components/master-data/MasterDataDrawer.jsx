import { useState } from 'react'

function normalizePhone(value)
{
  return value.replace(/\D/g, '')
}

function formatPhone(value)
{
  const digits = normalizePhone(value)
  if (digits.length === 11 && digits.startsWith('01'))
  {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 10 && digits.startsWith('0') && !digits.startsWith('01'))
  {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)} ${digits.slice(6)}`
  }
  return digits
}

function MasterDataDrawer({ config, record, onClose, onSave })
{
  const [form, setForm] = useState(record || {})

  function handleChange(event)
  {
    const field = config.columns.find((item) => item.key === event.target.name)
    const value = field.type === 'phone' ? normalizePhone(event.target.value) : event.target.value
    setForm((current) => ({ ...current, [event.target.name]: value }))
  }

  function handleSubmit(event)
  {
    event.preventDefault()
    onSave(form)
  }

  const isEditing = Boolean(record)

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="data-drawer" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-heading">
          <div>
            <p className="eyebrow">MASTER DATA</p>
            <h2 id="drawer-title">{isEditing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close">×</button>
        </div>
        <form className="data-form" onSubmit={handleSubmit}>
          {config.columns.map((field) => (
            <label className="form-field" key={field.key}>
              <span>{field.label}</span>
              <input inputMode={field.type === 'phone' ? 'numeric' : undefined} name={field.key} onChange={handleChange} required={field.key === config.idField} value={field.type === 'phone' ? formatPhone(form[field.key] || '') : form[field.key] || ''} />
            </label>
          ))}
          <div className="drawer-actions">
            <button className="filter-button" onClick={onClose} type="button">Cancel</button>
            <button className="primary-button" type="submit">Save</button>
          </div>
        </form>
      </aside>
    </div>
  )
}

export default MasterDataDrawer
