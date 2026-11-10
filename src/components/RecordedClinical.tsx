import type { LabView } from '../types'

export function RecordedRows({ view }: { view?: LabView | null }) {
  if (!view)
    return (
      <p className="detail-note" role="status">
        Recording unavailable.
      </p>
    )
  return (
    <div className="recorded-table-wrap">
      <table className="clinical-table">
        <caption className="sr-only">Recorded AI-READI example</caption>
        <thead>
          <tr>
            <th scope="col">Measure</th>
            <th scope="col">Value</th>
            <th scope="col">Unit</th>
          </tr>
        </thead>
        <tbody>
          {view.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
              <td>{row.unit || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
