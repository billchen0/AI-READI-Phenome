import type { ClinicalTab, MarkerId, ModalityGroup, ModalityId } from '../types'

export interface ModalityDef {
  id: ModalityId
  short: string
  label: string
  unit: string
  group: ModalityGroup
  accent: 'cyan' | 'amber'
  marker: MarkerId
}

export const MODALITIES: ModalityDef[] = [
  {
    id: 'ecg_12lead',
    short: 'ECG',
    label: '12-lead ECG',
    unit: 'mV',
    group: 'cardiac',
    accent: 'cyan',
    marker: 'chest',
  },
  {
    id: 'continuous_glucose_monitoring',
    short: 'CGM',
    label: 'Continuous glucose',
    unit: 'mg/dL',
    group: 'metabolic',
    accent: 'amber',
    marker: 'cgm',
  },
  {
    id: 'heart_rate',
    short: 'Heart rate',
    label: 'Heart rate',
    unit: 'beats/min',
    group: 'wrist',
    accent: 'cyan',
    marker: 'wrist',
  },
  {
    id: 'oxygen_saturation',
    short: 'Oxygen sat.',
    label: 'Oxygen saturation',
    unit: '%',
    group: 'wrist',
    accent: 'cyan',
    marker: 'wrist',
  },
  {
    id: 'physical_activity',
    short: 'Activity',
    label: 'Physical activity',
    unit: 'steps',
    group: 'wrist',
    accent: 'amber',
    marker: 'wrist',
  },
  {
    id: 'physical_activity_calorie',
    short: 'Calories',
    label: 'Activity calories',
    unit: 'kcal',
    group: 'wrist',
    accent: 'amber',
    marker: 'wrist',
  },
  {
    id: 'respiratory_rate',
    short: 'Resp. rate',
    label: 'Respiratory rate',
    unit: 'breaths/min',
    group: 'wrist',
    accent: 'cyan',
    marker: 'wrist',
  },
  {
    id: 'sleep',
    short: 'Sleep',
    label: 'Sleep',
    unit: 'stage',
    group: 'wrist',
    accent: 'amber',
    marker: 'wrist',
  },
  {
    id: 'stress',
    short: 'Stress',
    label: 'Stress',
    unit: 'device index',
    group: 'wrist',
    accent: 'cyan',
    marker: 'wrist',
  },
]

export const MODALITY_BY_ID = new Map(MODALITIES.map((modality) => [modality.id, modality]))

export const WRIST_MODALITIES = MODALITIES.filter((modality) => modality.group === 'wrist')

export const GROUP_LABELS: Record<ModalityGroup, string> = {
  cardiac: 'Cardiac',
  metabolic: 'Metabolic',
  wrist: 'Wrist monitor',
}

export interface ClinicalDef {
  id: ClinicalTab
  short: string
  label: string
}

export const CLINICAL_TABS: ClinicalDef[] = [
  { id: 'labs', short: 'Labs', label: 'Clinical labs' },
  { id: 'surveys', short: 'Surveys', label: 'Surveys' },
  { id: 'retinal', short: 'Retina', label: 'Retinal imaging' },
]

export type Vector3Tuple = [number, number, number]

export interface DevicePlacement {
  position: Vector3Tuple
  outward: Vector3Tuple
}

export const CGM_DEVICE: DevicePlacement = {
  position: [0.27779, 1.23313, -0.03188],
  outward: [0.15875, 0.00612, -0.9873],
}

export const CGM_HOTSPOT: Vector3Tuple = [0.279695, 1.2332, -0.043729]

export interface WristDevicePlacement {
  center: Vector3Tuple
  axis: Vector3Tuple
  outward: Vector3Tuple
  strapRadius: number
  strapTube: number
  strapWidthScale: number
  strapThicknessScale: number
  moduleOffset: number
}

export const WRIST_DEVICE: WristDevicePlacement = {
  center: [0.459, 1.047, 0.1786],
  axis: [0.505933, -0.48139, 0.715748],
  outward: [-0.55023, 0.42331, 0.71976],
  strapRadius: 0.026,
  strapTube: 0.0025,
  strapWidthScale: 0.84,
  strapThicknessScale: 3,
  moduleOffset: 0.029,
}

export const WRIST_HOTSPOT: Vector3Tuple = [0.440848, 1.061062, 0.200888]

export interface HotspotDef {
  id: MarkerId
  label: string
  side: 'left' | 'right'
  position: [number, number, number]
  modality: ModalityId
  ariaLabel: string
}

/**
 * Positions are in the candidate GLB's own coordinates: metres, +Y up, front +Z.
 * Values were derived by raycasting the delivered mesh at each attachment site.
 */
export const HOTSPOTS: HotspotDef[] = [
  {
    id: 'chest',
    label: 'ECG',
    side: 'left',
    position: [-0.045, 1.31, 0.14],
    modality: 'ecg_12lead',
    ariaLabel: 'Open the 12-lead ECG',
  },
  {
    id: 'cgm',
    label: 'CGM',
    side: 'right',
    position: CGM_HOTSPOT,
    modality: 'continuous_glucose_monitoring',
    ariaLabel: 'Open the continuous glucose example',
  },
  {
    id: 'wrist',
    label: 'WRIST',
    side: 'left',
    position: WRIST_HOTSPOT,
    modality: 'heart_rate',
    ariaLabel: 'Open the wrist monitor examples',
  },
]

export function markerForModality(id: ModalityId): MarkerId {
  return MODALITY_BY_ID.get(id)?.marker ?? 'wrist'
}
