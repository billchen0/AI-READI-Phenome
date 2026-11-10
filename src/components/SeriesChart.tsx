import { useId, useMemo } from 'react'
import type { ModalityDef } from '../data/modalities'
import type { SeriesView } from '../types'
import {
  axisTimeTicks,
  formatAxisTime,
  formatSampleCount,
  formatValue,
  parseTimeValue,
} from '../lib/format'
import { DataTable } from './DataTable'

interface Props {
  view: SeriesView
  def: ModalityDef
}

const WIDTH = 360
const HEIGHT = 232
const PAD = { top: 22, right: 14, bottom: 30, left: 48 }
const ACCENT_HEX = { cyan: '#7ad9e6', amber: '#e7ad67' } as const

export function SeriesChart({ view, def }: Props) {
  const rawId = useId()
  const gradientId = `trace-fill-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`

  const geometry = useMemo(() => {
    const samples = view.points.filter(
      ([, value]) => typeof value === 'number' && Number.isFinite(value),
    )
    if (samples.length === 0) return null

    const parsed = samples.map(([time]) => parseTimeValue(time))
    const hasTime = parsed.every((value): value is number => value !== null)
    const xs = hasTime ? (parsed as number[]) : samples.map((_, index) => index)

    const values = samples.map(([, value]) => value)
    let xMin = Math.min(...xs)
    let xMax = Math.max(...xs)
    let yMin = Math.min(...values)
    let yMax = Math.max(...values)

    if (xMax === xMin) xMax = xMin + 1
    if (yMax === yMin) {
      const pad = Math.max(Math.abs(yMin) * 0.05, 1)
      yMin -= pad
      yMax += pad
    } else if (def.id === 'ecg_12lead') {
      yMin = -0.5
      yMax = 1.5
    } else if (def.id === 'continuous_glucose_monitoring') {
      yMin = Math.floor((yMin - 8) / 20) * 20
      yMax = Math.ceil((yMax + 8) / 20) * 20
    } else {
      const pad = (yMax - yMin) * 0.08
      yMin -= pad
      yMax += pad
    }

    return { samples, xs, values, xMin, xMax, yMin, yMax, hasTime }
  }, [view.points, def.id])

  if (!geometry) {
    return (
      <div className="detail-state">
        <p>This preview entry contains no plottable values.</p>
      </div>
    )
  }

  const { samples, xs, values, xMin, xMax, yMin, yMax, hasTime } = geometry
  const plotWidth = WIDTH - PAD.left - PAD.right
  const plotHeight = HEIGHT - PAD.top - PAD.bottom
  const xScale = (time: number) => PAD.left + ((time - xMin) / (xMax - xMin)) * plotWidth
  const yScale = (value: number) => PAD.top + (1 - (value - yMin) / (yMax - yMin)) * plotHeight

  const linePath = xs
    .map(
      (time, index) =>
        `${index === 0 ? 'M' : 'L'}${xScale(time).toFixed(2)},${yScale(values[index]).toFixed(2)}`,
    )
    .join(' ')
  const lastX = xScale(xs[xs.length - 1])
  const lastY = yScale(values[values.length - 1])
  const baseline = PAD.top + plotHeight
  const areaPath =
    values.every((value) => value >= 0) && def.id !== 'ecg_12lead'
      ? `${linePath} L${lastX.toFixed(2)},${baseline.toFixed(2)} L${xScale(xs[0]).toFixed(2)},${baseline.toFixed(2)} Z`
      : null

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4
    return {
      value: yMax - (yMax - yMin) * ratio,
      y: PAD.top + plotHeight * ratio,
    }
  })
  const xTicks = axisTimeTicks(xMin, xMax).map((value, index) => ({
    value,
    x: xScale(value),
    anchor: (index === 0 ? 'start' : index === 3 ? 'end' : 'middle') as 'start' | 'end' | 'middle',
  }))

  const spanLabel = hasTime
    ? `from ${formatAxisTime(xMin, xMax - xMin)} to ${formatAxisTime(xMax, xMax - xMin)}`
    : `across ${formatSampleCount(samples.length)} ordered samples`
  const summary = `${view.label}: ${formatSampleCount(samples.length)} values, unit ${view.unit}, ${spanLabel}. Data table follows.`

  return (
    <>
      <figure className="plot-figure">
        <div
          className="plot-scroll"
          role="region"
          aria-label={`${view.label} plot. Scroll horizontally on a narrow screen.`}
          tabIndex={0}
        >
          <svg className="plot" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary}>
            <title>{view.label} plot</title>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT_HEX[def.accent]} stopOpacity="0.2" />
                <stop offset="100%" stopColor={ACCENT_HEX[def.accent]} stopOpacity="0" />
              </linearGradient>
            </defs>

            <text x={PAD.left} y={12} className="chart-unit">
              {view.unit}
            </text>

            {yTicks.map((tick) => (
              <g key={`y-${tick.y}`}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={tick.y}
                  y2={tick.y}
                  className="chart-grid"
                />
                <text x={PAD.left - 8} y={tick.y + 3} textAnchor="end" className="chart-tick">
                  {def.id === 'ecg_12lead' ? tick.value.toFixed(1) : formatValue(tick.value)}
                </text>
              </g>
            ))}

            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={baseline}
              y2={baseline}
              className="chart-axis"
            />

            {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
            <path d={linePath} className={`plot-trace plot-trace--${def.accent}`} pathLength={1} />
            <circle
              cx={lastX}
              cy={lastY}
              r="2.6"
              className={`plot-last plot-last--${def.accent}`}
            />

            {xTicks.map((tick) => (
              <text
                key={`x-${tick.x}`}
                x={tick.x}
                y={HEIGHT - 9}
                textAnchor={tick.anchor}
                className="chart-tick"
              >
                {hasTime
                  ? formatAxisTime(tick.value, xMax - xMin)
                  : `#${Math.round(tick.value) + 1}`}
              </text>
            ))}
          </svg>
        </div>
      </figure>
      <DataTable kind="series" label={view.label} unit={view.unit} points={samples} />
    </>
  )
}
