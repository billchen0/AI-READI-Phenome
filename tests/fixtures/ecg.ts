import type { SeriesPoint } from '../../src/types'

export const ECG_LEAD_NAMES = [
  'I',
  'II',
  'III',
  'aVR',
  'aVL',
  'aVF',
  'V1',
  'V2',
  'V3',
  'V4',
  'V5',
  'V6',
] as const

export type EcgLeadName = (typeof ECG_LEAD_NAMES)[number]

export const ECG_SAMPLE_RATE_HZ = 100
export const ECG_DURATION_SECONDS = 6
export const ECG_SAMPLE_COUNT = ECG_SAMPLE_RATE_HZ * ECG_DURATION_SECONDS + 1
export const ECG_HEART_RATE_BPM = 72

export interface EcgLead {
  name: EcgLeadName
  points: SeriesPoint[]
}

export interface EcgRecord {
  sampleRate: number
  durationSeconds: number
  leads: EcgLead[]
}

interface LeadMorphology {
  p: number
  q: number
  r: number
  s: number
  t: number
  wander: number
}

const LIMB_MORPHOLOGY = {
  I: { p: 0.06, q: -0.03, r: 0.58, s: -0.1, t: 0.17, wander: 0.012 },
  II: { p: 0.1, q: -0.04, r: 0.98, s: -0.16, t: 0.26, wander: -0.008 },
} as const satisfies Record<'I' | 'II', LeadMorphology>

const PRECORDIAL_MORPHOLOGY = {
  V1: { p: 0.04, q: 0, r: 0.1, s: -0.62, t: 0.05, wander: 0.006 },
  V2: { p: 0.05, q: -0.005, r: 0.2, s: -0.82, t: 0.12, wander: -0.005 },
  V3: { p: 0.055, q: -0.008, r: 0.42, s: -0.5, t: 0.2, wander: 0.007 },
  V4: { p: 0.06, q: -0.015, r: 0.92, s: -0.28, t: 0.28, wander: -0.006 },
  V5: { p: 0.06, q: -0.018, r: 0.86, s: -0.14, t: 0.26, wander: 0.005 },
  V6: { p: 0.055, q: -0.014, r: 0.62, s: -0.06, t: 0.2, wander: -0.004 },
} as const satisfies Record<'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6', LeadMorphology>

const BEAT_SECONDS = 60 / ECG_HEART_RATE_BPM
const PHASE_OFFSET = 0.18

function round(value: number, digits = 3): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function gaussian(value: number, center: number, width: number, amplitude: number): number {
  const distance = (value - center) / width
  return amplitude * Math.exp(-0.5 * distance * distance)
}

function morphologyAt(phase: number, morphology: LeadMorphology, time: number): number {
  return (
    gaussian(phase, 0.09, 0.025, morphology.p) +
    gaussian(phase, 0.196, 0.008, morphology.q) +
    gaussian(phase, 0.218, 0.011, morphology.r) +
    gaussian(phase, 0.242, 0.01, morphology.s) +
    gaussian(phase, 0.39, 0.058, morphology.t) +
    morphology.wander * Math.sin(2 * Math.PI * 0.27 * time + morphology.p * 20)
  )
}

function sampleTimes(): number[] {
  return Array.from({ length: ECG_SAMPLE_COUNT }, (_, index) =>
    round(index / ECG_SAMPLE_RATE_HZ, 2),
  )
}

function generatedPoints(morphology: LeadMorphology): SeriesPoint[] {
  return sampleTimes().map((time) => {
    const phase = (time + PHASE_OFFSET) % BEAT_SECONDS
    return [time, round(morphologyAt(phase, morphology, time))]
  })
}

function combine(
  name: EcgLeadName,
  primarySource: SeriesPoint[],
  secondarySource: SeriesPoint[],
  transform: (primary: number, secondary: number) => number,
): EcgLead {
  return {
    name,
    points: primarySource.map(([time, value], index) => [
      time,
      round(transform(value as number, secondarySource[index][1] as number)),
    ]),
  }
}

export function generateSynthetic12Lead(): EcgRecord {
  const leadI = generatedPoints(LIMB_MORPHOLOGY.I)
  const leadII = generatedPoints(LIMB_MORPHOLOGY.II)

  const leads: EcgLead[] = [
    { name: 'I', points: leadI },
    { name: 'II', points: leadII },
    combine('III', leadII, leadI, (second, first) => second - first),
    combine('aVR', leadI, leadII, (first, second) => -(first + second) / 2),
    combine('aVL', leadI, leadII, (first, second) => first - second / 2),
    combine('aVF', leadII, leadI, (second, first) => second - first / 2),
    { name: 'V1', points: generatedPoints(PRECORDIAL_MORPHOLOGY.V1) },
    { name: 'V2', points: generatedPoints(PRECORDIAL_MORPHOLOGY.V2) },
    { name: 'V3', points: generatedPoints(PRECORDIAL_MORPHOLOGY.V3) },
    { name: 'V4', points: generatedPoints(PRECORDIAL_MORPHOLOGY.V4) },
    { name: 'V5', points: generatedPoints(PRECORDIAL_MORPHOLOGY.V5) },
    { name: 'V6', points: generatedPoints(PRECORDIAL_MORPHOLOGY.V6) },
  ]

  return {
    sampleRate: ECG_SAMPLE_RATE_HZ,
    durationSeconds: ECG_DURATION_SECONDS,
    leads,
  }
}
