import { useMemo } from 'react'
import type { CategoriesView } from '../types'
import {
  formatAxisTime,
  formatSampleCount,
  humanizeStage,
  parseTimeValue,
  stageKey,
} from '../lib/format'
import { DataTable } from './DataTable'

interface Props {
  view: CategoriesView
}

const WIDTH = 360
const PAD = { top: 16, right: 12, bottom: 28, left: 58 }
const ROW_HEIGHT = 26
const STAGE_ORDER = ['wake', 'rem', 'light', 'deep', 'unknown']
const STAGE_COLORS: Record<string, string> = {
  wake: 'var(--stage-wake)',
  rem: 'var(--stage-rem)',
  light: 'var(--stage-light)',
  deep: 'var(--stage-deep)',
  unknown: 'var(--stage-unknown)',
}

function stageColor(stage: string): string {
  return STAGE_COLORS[stageKey(stage)] ?? STAGE_COLORS.unknown
}

export function SleepTimeline({ view }: Props) {
  const prepared = useMemo(() => {
    const segments = view.segments
      .map((segment, index) => ({
        ...segment,
        startValue: parseTimeValue(segment.start),
        endValue: parseTimeValue(segment.end),
        index,
      }))
      .filter(
        (segment) =>
          segment.startValue !== null &&
          segment.endValue !== null &&
          segment.endValue > segment.startValue,
      )

    if (segments.length === 0) return null

    const stages = Array.from(new Set(segments.map((segment) => humanizeStage(segment.label))))
    stages.sort((a, b) => {
      const aIndex = STAGE_ORDER.indexOf(stageKey(a))
      const bIndex = STAGE_ORDER.indexOf(stageKey(b))
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
    })

    const xMin = Math.min(...segments.map((segment) => segment.startValue as number))
    const xMax = Math.max(...segments.map((segment) => segment.endValue as number))

    return { segments, stages, xMin, xMax }
  }, [view.segments])

  if (!prepared) {
    return (
      <div className="detail-state">
        <p>This preview entry contains no valid sleep intervals.</p>
      </div>
    )
  }

  const { segments, stages, xMin, xMax } = prepared
  const safeXMax = xMax === xMin ? xMin + 1 : xMax
  const height = PAD.top + stages.length * ROW_HEIGHT + PAD.bottom
  const plotWidth = WIDTH - PAD.left - PAD.right
  const xScale = (value: number) => PAD.left + ((value - xMin) / (safeXMax - xMin)) * plotWidth
  const baseline = PAD.top + stages.length * ROW_HEIGHT

  const xTicks = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3
    return {
      value: xMin + (safeXMax - xMin) * ratio,
      x: PAD.left + plotWidth * ratio,
      anchor: (index === 0 ? 'start' : index === 3 ? 'end' : 'middle') as
        | 'start'
        | 'end'
        | 'middle',
    }
  })

  const summary = `Sleep stage timeline: ${formatSampleCount(segments.length)} intervals across ${stages.length} stages, from ${formatAxisTime(xMin, xMax - xMin)} to ${formatAxisTime(xMax, xMax - xMin)}. Data table follows.`

  return (
    <>
      <figure className="plot-figure">
        <div
          className="plot-scroll"
          role="region"
          aria-label="Sleep stage timeline. Scroll horizontally on a narrow screen."
          tabIndex={0}
        >
          <svg className="plot" viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={summary}>
            <title>Sleep stage timeline</title>

            {xTicks.map((tick) => (
              <line
                key={`grid-${tick.x}`}
                x1={tick.x}
                x2={tick.x}
                y1={PAD.top}
                y2={baseline}
                className="chart-grid"
              />
            ))}

            {stages.map((stage, row) => {
              const center = PAD.top + row * ROW_HEIGHT + ROW_HEIGHT / 2
              return (
                <g key={stage}>
                  <line
                    x1={PAD.left}
                    x2={WIDTH - PAD.right}
                    y1={center}
                    y2={center}
                    className="sleep-lane"
                  />
                  <text
                    x={PAD.left - 8}
                    y={center + 3}
                    textAnchor="end"
                    className="chart-tick chart-tick--stage"
                  >
                    {stage}
                  </text>
                </g>
              )
            })}

            {segments.map((segment) => {
              const row = stages.indexOf(humanizeStage(segment.label))
              const center = PAD.top + row * ROW_HEIGHT + ROW_HEIGHT / 2
              const x = xScale(segment.startValue as number)
              const width = Math.max(xScale(segment.endValue as number) - x, 1.5)
              const key = stageKey(humanizeStage(segment.label))
              return (
                <rect
                  key={`${segment.index}-${String(segment.start)}`}
                  x={x}
                  y={center - 7}
                  width={width}
                  height={14}
                  className={`sleep-segment sleep-segment--${key}`}
                  style={{ fill: stageColor(segment.label) }}
                >
                  <title>
                    {humanizeStage(segment.label)}: {String(segment.start)} to {String(segment.end)}
                  </title>
                </rect>
              )
            })}

            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={baseline}
              y2={baseline}
              className="chart-axis"
            />

            {xTicks.map((tick) => (
              <text
                key={`label-${tick.x}`}
                x={tick.x}
                y={height - 8}
                textAnchor={tick.anchor}
                className="chart-tick"
              >
                {formatAxisTime(tick.value, xMax - xMin)}
              </text>
            ))}
          </svg>
        </div>
      </figure>

      <ul className="stage-legend" aria-label="Sleep stage legend">
        {stages.map((stage) => (
          <li key={stage}>
            <span
              className={`legend-swatch sleep-segment--${stageKey(stage)}`}
              style={{ background: stageColor(stage) }}
              aria-hidden="true"
            />
            {stage}
          </li>
        ))}
      </ul>

      <DataTable
        kind="categories"
        label="Sleep stages"
        unit={view.unit}
        segments={segments.map((segment) => ({
          start: segment.start,
          end: segment.end,
          label: segment.label,
        }))}
      />
    </>
  )
}
