import type { OrganId } from '../types'

export interface BiomarkerGroup {
  title: string
  measurements: string[]
}

export interface OrganDef {
  id: OrganId
  label: string
  short: string
  side: 'left' | 'right'
  position: [number, number, number]
  hotspotOffset?: [number, number, number]
  groups: BiomarkerGroup[]
}

export const ORGANS: OrganDef[] = [
  {
    id: 'brain',
    label: 'Brain / cognition',
    short: 'Brain',
    side: 'left',
    position: [0, 1.609, 0.051],
    hotspotOffset: [-0.055, 0.025, 0.065],
    groups: [{ title: 'Cognitive assessment', measurements: ['MoCA total score'] }],
  },
  {
    id: 'nervous',
    label: 'Peripheral nervous system',
    short: 'Nerves',
    side: 'right',
    position: [0.185, 0.13, 0.04],
    hotspotOffset: [0.035, 0.05, 0.06],
    groups: [
      {
        title: 'Monofilament assessment',
        measurements: ['Right foot · correct responses', 'Left foot · correct responses'],
      },
    ],
  },
  {
    id: 'eye',
    label: 'Eye / retina',
    short: 'Retina',
    side: 'right',
    position: [0.03, 1.605, 0.14],
    hotspotOffset: [0, 0, 0.006],
    groups: [],
  },
  {
    id: 'heart',
    label: 'Heart',
    short: 'Heart',
    side: 'right',
    position: [0.012, 1.3, 0.025],
    hotspotOffset: [0.025, 0.015, 0.085],
    groups: [
      {
        title: 'Cardiac blood measurements',
        measurements: ['NT-proBNP', 'Troponin-T'],
      },
    ],
  },
  {
    id: 'kidneys',
    label: 'Kidneys',
    short: 'Kidneys',
    side: 'right',
    position: [0, 1.1, -0.033],
    hotspotOffset: [0.068, 0.04, 0.035],
    groups: [
      {
        title: 'Kidney-related measurements',
        measurements: ['Creatinine', 'BUN', 'Urine albumin', 'Urine creatinine'],
      },
    ],
  },
  {
    id: 'liver',
    label: 'Liver',
    short: 'Liver',
    side: 'left',
    position: [-0.03, 1.175, 0.04],
    hotspotOffset: [-0.065, 0.01, 0.075],
    groups: [
      {
        title: 'Liver-related measurements',
        measurements: ['ALT', 'AST', 'Total bilirubin'],
      },
    ],
  },
  {
    id: 'metabolic',
    label: 'Pancreas / metabolic',
    short: 'Metabolic',
    side: 'right',
    position: [0.005, 1.13, 0.008],
    hotspotOffset: [0.075, 0.018, 0.04],
    groups: [
      {
        title: 'Metabolic / pancreas context',
        measurements: ['Glucose', 'Insulin', 'C-peptide'],
      },
      {
        title: 'Systemic glycemic and lipid context',
        measurements: [
          'HbA1c',
          'Total cholesterol',
          'Triglycerides',
          'HDL cholesterol',
          'LDL cholesterol',
        ],
      },
    ],
  },
]

export const ORGAN_BY_ID = new Map(ORGANS.map((organ) => [organ.id, organ]))
