export function parseTimeValue(value: string | number): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const trimmed = value.trim()
  if (!trimmed) return null

  const numeric = Number(trimmed)
  if (Number.isFinite(numeric)) return numeric

  const withoutPlus = trimmed.startsWith('+') ? trimmed.slice(1) : trimmed

  if (/^\d+(?:\.\d+)?s$/.test(withoutPlus)) {
    const seconds = Number.parseFloat(withoutPlus)
    return Number.isFinite(seconds) ? seconds : null
  }

  if (/^\d{1,3}:\d{2}(?::\d{2})?$/.test(withoutPlus)) {
    const parts = withoutPlus.split(':').map(Number)
    if (parts.some((part) => !Number.isFinite(part))) return null
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    return parts[0] * 3600 + parts[1] * 60
  }

  return null
}

export function formatElapsed(seconds: number, span?: number): string {
  if (!Number.isFinite(seconds)) return '—'
  if (seconds < 0) seconds = 0

  const safeSpan = span ?? seconds

  if (safeSpan < 90) return `${seconds.toFixed(1)}s`
  if (safeSpan < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainder = Math.round(seconds % 60)
    if (remainder === 60) return `${minutes + 1}:00`
    return `${minutes}:${String(remainder).padStart(2, '0')}`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (minutes === 60) return `${hours + 1}:00`
  return `${hours}:${String(minutes).padStart(2, '0')}`
}

export function formatAxisTime(seconds: number, span?: number): string {
  return formatElapsed(seconds, span)
}

export function formatValue(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const magnitude = Math.abs(value)

  if (magnitude >= 1000) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
  }
  if (magnitude >= 100) return value.toFixed(1).replace(/\.0$/, '')
  if (magnitude >= 10) return value.toFixed(1)
  if (magnitude >= 0.1) return value.toFixed(2)
  return value.toFixed(3)
}

export function formatSampleCount(count: number): string {
  return new Intl.NumberFormat('en-US').format(count)
}

export function humanizeStage(stage: string): string {
  const lower = stage.trim().toLowerCase()
  if (!lower) return 'Unknown'
  if (lower === 'rem') return 'REM'
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export function stageKey(stage: string): string {
  return (
    stage
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') || 'unknown'
  )
}

export function axisTimeTicks(start: number, end: number): number[] {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return []
  return Array.from({ length: 4 }, (_, index) => start + ((end - start) * index) / 3)
}
