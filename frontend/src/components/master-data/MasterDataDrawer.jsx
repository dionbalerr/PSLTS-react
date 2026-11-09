import React, { useState } from 'react'

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

function validateForm(config, form)
{
  return config.columns.reduce((currentErrors, field) =>
  {
    const value = form[field.key] || ''

    if (field.required && !value.trim())
    {
      return { ...currentErrors, [field.key]: `${field.label} is required.` }
    }

    if (field.type === 'money' && value && !/^\d+(\.\d{1,2})?$/.test(value))
    {
      return { ...currentErrors, [field.key]: `${field.label} allows up to 2 decimal places.` }
    }

    return currentErrors
  }, {})
}

function MasterDataDrawer({ config, error, record, onClose, onSave, saving })
{
  const [form, setForm] = useState(record || {})
  const [errors, setErrors] = useState({})

  function handleChange(event)
  {
    const field = config.columns.find((item) => item.key === event.target.name)
    const value = field.type === 'phone' ? normalizePhone(event.target.value) : event.target.value
    setForm((current) => ({ ...current, [event.target.name]: value }))
    setErrors((current) => ({ ...current, [event.target.name]: undefined }))
  }

  function handleSubmit(event)
  {
    event.preventDefault()

    const nextErrors = validateForm(config, form)
    if (Object.keys(nextErrors).length > 0)
    {
      setErrors(nextErrors)
      return
    }

    onSave(form)
  }

  function handleClose()
  {
    if (!saving)
    {
      onClose()
    }
  }

  const isEditing = Boolean(record)

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={handleClose}>
      <aside className="data-drawer" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-heading">
          <div>
            <p className="eyebrow">MASTER DATA</p>
            <h2 id="drawer-title">{isEditing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2>
          </div>
          <button className="icon-button" disabled={saving} onClick={handleClose} type="button" aria-label="Close">×</button>
        </div>
        <form className="data-form" onSubmit={handleSubmit}>
          {error && <div className="form-error-summary" role="alert">{error.message}</div>}
          {config.columns.map((field) => (
            <label className="form-field" key={field.key}>
              <span>{field.label}</span>
              <input aria-invalid={Boolean(errors[field.key] || error?.fields?.[field.key])} aria-label={field.label} disabled={saving} inputMode={field.type === 'phone' ? 'numeric' : field.type === 'money' ? 'decimal' : undefined} name={field.key} onChange={handleChange} value={field.type === 'phone' ? formatPhone(form[field.key] || '') : form[field.key] || ''} />
              {(errors[field.key] || error?.fields?.[field.key]) && <span className="form-error">{errors[field.key] || error.fields[field.key]}</span>}
            </label>
          ))}
          <div className="drawer-actions">
            <button className="filter-button" disabled={saving} onClick={onClose} type="button">Cancel</button>
            <button className="primary-button" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </aside>
    </div>
  )
}

export default MasterDataDrawer
