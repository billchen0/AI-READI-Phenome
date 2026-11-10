import type { EcgView, LabRow, LabView, SeriesView, ShowcasePayload } from '../types'
import { generateSynthetic12Lead } from './syntheticEcg'

const DAY_SECONDS = 24 * 60 * 60
const round = (value: number) => Math.round(value * 100) / 100
const peak = (hour: number, center: number, width: number) =>
  Math.exp(-(((hour - center) / width) ** 2))

function daySeries(label: string, unit: string, valueAtHour: (hour: number) => number): SeriesView {
  return {
    label,
    unit,
    kind: 'series',
    note: 'Independently generated synthetic example.',
    points: Array.from({ length: 289 }, (_, index) => {
      const seconds = (index * DAY_SECONDS) / 288
      return [seconds, round(valueAtHour(seconds / 3600))]
    }),
  }
}

function measurementTable(label: string, rows: LabRow[]): LabView {
  return { label, kind: 'labs', rows, note: 'Synthetic example values.', caveat: '' }
}

const row = (label: string, value: number, unit: string): LabRow => ({
  label,
  value: String(value),
  unit,
})
const ecgRecord = generateSynthetic12Lead()
const ecg: EcgView = {
  ...ecgRecord,
  label: '12-lead ECG',
  kind: 'ecg',
  unit: 'mV',
  note: 'Synthetic twelve-lead waveform and illustrative morphology values.',
  measurements: [
    row('Rate', 72, 'bpm'),
    row('PR', 160, 'ms'),
    row('QRS duration', 90, 'ms'),
    row('QT', 400, 'ms'),
    row('QTc', 438, 'ms'),
    row('P axis', 55, '°'),
    row('QRS axis', 42, '°'),
    row('T axis', 48, '°'),
  ],
}

// Generic daily rhythms and smooth event peaks provide readable examples without
// copying, fitting, or transforming participant recordings.
export const SYNTHETIC_SHOWCASE: ShowcasePayload = {
  source: 'Synthetic data based on the AI-READI format',
  modalities: {
    ecg_12lead: ecg,
    continuous_glucose_monitoring: daySeries(
      'Continuous glucose',
      'mg/dL',
      (hour) =>
        94 +
        4 * Math.sin((hour * Math.PI) / 12 - 1) +
        1.5 * Math.sin(hour * 4.3) +
        43 * peak(hour, 8.5, 0.85) +
        51 * peak(hour, 13.5, 1.05) +
        47 * peak(hour, 19.4, 1.2),
    ),
    heart_rate: daySeries(
      'Heart rate',
      'beats/min',
      (hour) =>
        62 +
        9 * peak(hour, 13, 6) +
        45 * peak(hour, 8.1, 0.45) +
        37 * peak(hour, 17.6, 0.6) +
        3 * Math.sin(hour * 3.7),
    ),
    oxygen_saturation: daySeries(
      'Oxygen saturation',
      '%',
      (hour) => 97.5 + 0.7 * Math.sin(hour * 1.8) + 0.35 * Math.sin(hour * 7.1),
    ),
    physical_activity: daySeries('Physical activity', 'steps', (hour) =>
      Math.round(
        320 * peak(hour, 8.1, 0.45) +
          270 * peak(hour, 17.6, 0.6) +
          55 * peak(hour, 12.5, 0.5) +
          (hour > 7 && hour < 22 ? Math.max(0, 22 * Math.sin(hour * 5)) : 0),
      ),
    ),
    physical_activity_calorie: daySeries(
      'Activity calories',
      'kcal',
      (hour) => 4 + 24 * peak(hour, 8.1, 0.45) + 20 * peak(hour, 17.6, 0.6) + 2 * peak(hour, 13, 5),
    ),
    respiratory_rate: daySeries(
      'Respiratory rate',
      'breaths/min',
      (hour) =>
        14 + 1.1 * Math.sin(hour * 1.6) + 4.5 * peak(hour, 8.1, 0.45) + 3 * peak(hour, 17.6, 0.6),
    ),
    stress: daySeries(
      'Stress',
      'index',
      (hour) =>
        22 + 25 * peak(hour, 11, 2.5) + 17 * peak(hour, 16.5, 1.7) + 7 * Math.sin(hour * 2.1),
    ),
    sleep: {
      label: 'Sleep',
      kind: 'categories',
      unit: 'stage',
      note: 'Synthetic overnight sleep stages.',
      segments: [
        'awake',
        'light',
        'light',
        'deep',
        'deep',
        'light',
        'rem',
        'light',
        'light',
        'deep',
        'deep',
        'light',
        'rem',
        'rem',
        'light',
        'light',
        'deep',
        'light',
        'rem',
        'rem',
        'light',
        'light',
        'rem',
        'rem',
        'light',
        'light',
        'rem',
        'rem',
        'light',
        'rem',
        'light',
        'awake',
      ].map((label, index) => ({ start: index * 900, end: (index + 1) * 900, label })),
    },
  },
  clinical: {
    labs: measurementTable('Clinical labs', [
      row('HbA1c', 5.6, '%'),
      row('Glucose', 101, 'mg/dL'),
      row('Insulin', 9.4, 'µIU/mL'),
      row('C-peptide', 2.1, 'ng/mL'),
      row('NT-proBNP', 48, 'pg/mL'),
      row('Troponin-T', 7, 'ng/L'),
      row('Creatinine', 0.88, 'mg/dL'),
      row('BUN', 15, 'mg/dL'),
      row('Urine albumin', 9, 'µg/mL'),
      row('Urine creatinine', 86, 'mg/dL'),
      row('ALT', 22, 'U/L'),
      row('AST', 20, 'U/L'),
      row('Total bilirubin', 0.6, 'mg/dL'),
      row('Total cholesterol', 182, 'mg/dL'),
      row('Triglycerides', 126, 'mg/dL'),
      row('HDL cholesterol', 54, 'mg/dL'),
      row('LDL cholesterol', 103, 'mg/dL'),
    ]),
    nervous: measurementTable('Monofilament test', [
      row('Right foot · correct responses', 10, 'of 10'),
      row('Left foot · correct responses', 9, 'of 10'),
    ]),
    cognitive: measurementTable('MoCA', [
      row('MoCA total score', 27, 'of 30'),
      row('Memory Index Score', 12, 'of 15'),
      row('Orientation', 6, 'points'),
      row('Abstraction', 2, 'points'),
      row('Delayed recall', 3, 'points'),
      row('Digit span', 2, 'points'),
      row('Letter tapping', 1, 'points'),
      row('Serial subtraction', 3, 'points'),
      row('Sentence repetition', 2, 'points'),
      row('Verbal fluency', 1, 'points'),
      row('Naming', 3, 'points'),
      row('Trail drawing', 1, 'point'),
      row('Cube drawing', 1, 'point'),
      row('Clock drawing', 2, 'points'),
    ]),
    surveys: measurementTable('Survey scores', [
      row('Diet score', 6, 'score'),
      row('CES-D-10 score', 8, 'score'),
    ]),
  },
  environment: measurementTable('Environment', [
    row('Temperature', 22.1, '°C'),
    row('Humidity', 46.2, '%'),
    row('PM₂.₅', 4.8, 'µg/m³'),
    row('VOC', 68, 'index'),
    row('NOx', 2, 'index'),
    row('Light · 415 nm', 0.004, 'relative'),
    row('Light · 555 nm', 0.016, 'relative'),
    row('Light · 680 nm', 0.028, 'relative'),
  ]),
}
