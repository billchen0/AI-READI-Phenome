import { useMemo } from 'react'
import type { EcgView } from '../types'
import { formatSampleCount } from '../lib/format'

const VIEW_WIDTH = 620
const ROW_HEIGHT = 54
const PAD_TOP = 4
const PAD_BOTTOM = 4
const PLOT_HEIGHT = ROW_HEIGHT - PAD_TOP - PAD_BOTTOM

function xScale(time: number, duration: number): number {
  return (time / duration) * VIEW_WIDTH
}

export function EcgChart({ view }: { view: EcgView }) {
  const values = view.leads.flatMap((lead) => lead.points.map((point) => point[1]))
  const low = values.reduce((min, value) => Math.min(min, value), -0.95)
  const high = values.reduce((max, value) => Math.max(max, value), 1.55)
  const yMin = Math.floor((low - 0.05) * 2) / 2
  const yMax = Math.ceil((high + 0.05) * 2) / 2
  const yScale = (value: number) => PAD_TOP + (1 - (value - yMin) / (yMax - yMin)) * PLOT_HEIGHT
  const summary = useMemo(() => {
    const samples = view.leads[0]?.points.length ?? 0
    return `${view.label} with ${view.leads.length} leads and ${formatSampleCount(samples)} samples per lead at ${view.sampleRate} hertz over ${view.durationSeconds} seconds. ${view.note}`
  }, [view])

  const prepared = useMemo(
    () =>
      view.leads.map((lead) => {
        const values = lead.points.map(([, value]) => value)
        const path = lead.points
          .map(([time, value], index) => {
            const x = xScale(time as number, view.durationSeconds).toFixed(2)
            const y = yScale(value).toFixed(2)
            return `${index === 0 ? 'M' : 'L'}${x},${y}`
          })
          .join(' ')
        return {
          ...lead,
          path,
          min: Math.min(...values),
          max: Math.max(...values),
          samples: lead.points.length,
          precordial: lead.name.startsWith('V'),
        }
      }),
    [view, yMin, yMax],
  )

  const ticks = Array.from({ length: Math.floor(view.durationSeconds) + 1 }, (_, second) => ({
    second,
    x: xScale(second, view.durationSeconds),
  }))

  const gridValues = [-0.5, 0, 0.5, 1]

  return (
    <figure className="ecg-chart">
      <div
        className="ecg-scroll"
        role="region"
        aria-label="12-lead ECG chart. Scroll horizontally on a narrow screen."
        tabIndex={0}
      >
        <div className="ecg-inner">
          <div className="ecg-row ecg-row--axis">
            <span className="ecg-label ecg-label--axis">lead</span>
            <svg
              className="ecg-axis"
              viewBox={`0 0 ${VIEW_WIDTH} 32`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {ticks.map((tick) => (
                <g key={tick.second}>
                  <line x1={tick.x} x2={tick.x} y1={16} y2={31} className="ecg-grid-line" />
                  <text
                    x={
                      tick.second === 0
                        ? 2
                        : tick.second === view.durationSeconds
                          ? VIEW_WIDTH - 2
                          : tick.x
                    }
                    y={11}
                    textAnchor={
                      tick.second === 0
                        ? 'start'
                        : tick.second === view.durationSeconds
                          ? 'end'
                          : 'middle'
                    }
                    className="ecg-axis-text"
                  >
                    {tick.second} s
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {prepared.map((lead) => (
            <div className="ecg-row" key={lead.name}>
              <span className="ecg-label">{lead.name}</span>
              <svg
                className="ecg-strip"
                viewBox={`0 0 ${VIEW_WIDTH} ${ROW_HEIGHT}`}
                preserveAspectRatio="none"
                role="img"
                aria-label={`${lead.name} lead, ${formatSampleCount(lead.samples)} samples`}
              >
                <title>{lead.name} lead trace</title>
                {ticks.map((tick) => (
                  <line
                    key={`grid-${tick.second}`}
                    x1={tick.x}
                    x2={tick.x}
                    y1={PAD_TOP}
                    y2={ROW_HEIGHT - PAD_BOTTOM}
                    className="ecg-grid-line"
                  />
                ))}
                {gridValues.map((value) => (
                  <line
                    key={`mv-${value}`}
                    x1={0}
                    x2={VIEW_WIDTH}
                    y1={yScale(value)}
                    y2={yScale(value)}
                    className={value === 0 ? 'ecg-baseline' : 'ecg-grid-line'}
                  />
                ))}
                <path
                  d={lead.path}
                  className={`ecg-trace ecg-trace--${lead.precordial ? 'chest' : 'limb'}`}
                  pathLength={1}
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <section className="ecg-morphology">
        <h3>Device-generated morphology</h3>
        {view.measurements?.length ? (
          <dl>
            {view.measurements.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>
                  {row.value} <span>{row.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p>Rate, PR, QRS duration, QT/QTc, and P/QRS/T axes are included in the device report.</p>
        )}
        <p className="card-note">Automated measurements · not physician reviewed</p>
      </section>
      <p className="sr-only">{summary}</p>
    </figure>
  )
}
