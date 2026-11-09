import React from 'react'

function DataTable({ columns, rows, onEdit, onDelete })
{
  if (rows.length === 0)
  {
    return <div className="table-empty">No records found.</div>
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key} style={{ width: column.width }}>{column.label}</th>)}
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[columns[0].key]}>
              {columns.map((column, index) => (
                <td key={column.key} title={row[column.key] ? String(row[column.key]) : undefined}>
                  {index === 0 ? <strong>{row[column.key]}</strong> : row[column.key] || '—'}
                </td>
              ))}
              <td className="table-actions">
                <div className="table-action-group">
                  <button aria-label={`Edit ${row[columns[0].key]}`} className="row-action icon-action edit-action" onClick={() => onEdit(row)} title="Edit" type="button">✎</button>
                  <button aria-label={`Delete ${row[columns[0].key]}`} className="row-action icon-action danger-action" onClick={() => onDelete(row)} title="Delete" type="button">🗑</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
