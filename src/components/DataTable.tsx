import type { SeriesPoint, SleepSegment } from '../types'
import { formatValue, humanizeStage } from '../lib/format'
import { TableIcon } from './Icons'

interface SeriesTableProps {
  kind: 'series'
  label: string
  unit: string
  points: SeriesPoint[]
}

interface CategoryTableProps {
  kind: 'categories'
  label: string
  unit: string
  segments: SleepSegment[]
}

type Props = SeriesTableProps | CategoryTableProps

export function DataTable(props: Props) {
  const count = props.kind === 'series' ? props.points.length : props.segments.length

  return (
    <details className="data-table">
      <summary>
        <TableIcon />
        <span>Data</span>
      </summary>

      <div
        className={count > 12 ? 'table-scroll' : 'table-inline'}
        role="region"
        aria-label={`${props.label} data table`}
        tabIndex={0}
      >
        <table>
          <caption>
            {props.label} — {props.unit}
          </caption>
          {props.kind === 'series' ? (
            <>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Value ({props.unit})</th>
                </tr>
              </thead>
              <tbody>
                {props.points.map(([time, value], index) => (
                  <tr key={`${String(time)}-${index}`}>
                    <td>{String(time)}</td>
                    <td>{formatValue(value)}</td>
                  </tr>
                ))}
              </tbody>
            </>
          ) : (
            <>
              <thead>
                <tr>
                  <th scope="col">Start</th>
                  <th scope="col">End</th>
                  <th scope="col">Stage</th>
                </tr>
              </thead>
              <tbody>
                {props.segments.map((segment, index) => (
                  <tr key={`${String(segment.start)}-${index}`}>
                    <td>{String(segment.start)}</td>
                    <td>{String(segment.end)}</td>
                    <td>{humanizeStage(segment.label)}</td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>
    </details>
  )
}
