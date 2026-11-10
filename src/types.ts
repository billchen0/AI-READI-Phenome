export type SeriesPoint = [time: string | number, value: number]

export interface SeriesView {
  label: string
  unit: string
  kind: 'series'
  points: SeriesPoint[]
  note: string
}

export interface SleepSegment {
  start: string | number
  end: string | number
  label: string
}

export interface CategoriesView {
  label: string
  unit: string
  kind: 'categories'
  segments: SleepSegment[]
  note: string
}

export interface EcgLeadSeries {
  name: string
  points: SeriesPoint[]
}

export interface EcgView {
  label: string
  unit: string
  kind: 'ecg'
  measurements?: LabRow[]
  sampleRate: number
  durationSeconds: number
  leads: EcgLeadSeries[]
  note: string
}

export type ModalityView = SeriesView | CategoriesView | EcgView

export interface ShowcasePayload {
  clinical: Record<'labs' | 'surveys' | 'nervous' | 'cognitive', LabView>
  environment: LabView
  source?: string
  modalities: Record<ModalityId, ModalityView>
}
export interface LabRow {
  label: string
  value: string
  unit: string
}

export interface LabView {
  label: string
  kind: 'labs'
  rows: LabRow[]
  note: string
  caveat: string
}

export type ModalityGroup = 'cardiac' | 'metabolic' | 'wrist'

export type ModalityId =
  | 'ecg_12lead'
  | 'continuous_glucose_monitoring'
  | 'heart_rate'
  | 'oxygen_saturation'
  | 'physical_activity'
  | 'physical_activity_calorie'
  | 'respiratory_rate'
  | 'sleep'
  | 'stress'

export type MarkerId = 'chest' | 'cgm' | 'wrist'

export type ClinicalTab = 'labs' | 'surveys' | 'retinal'

export type OrganId = 'heart' | 'kidneys' | 'liver' | 'metabolic' | 'eye' | 'nervous' | 'brain'

export type BodyLayer = 'sensors' | 'organs'

export type ActiveView =
  | { kind: 'detail'; modality: ModalityId }
  | { kind: 'clinical'; tab: ClinicalTab }
  | { kind: 'environment' }
  | { kind: 'biomarker'; organ: OrganId }
  | { kind: 'index' }
