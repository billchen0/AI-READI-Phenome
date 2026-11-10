import { CardActions } from '../CardActions'
import { useShowcaseData } from '../../context/ShowcaseData'
import { ORGAN_BY_ID } from '../../data/organs'
import type { ClinicalTab, OrganId } from '../../types'
import { CardHeader } from '../CardHeader'
import { MeasurementTable } from '../MeasurementTable'
import { CognitiveDetail } from './CognitiveDetail'
import { NervousDetail } from '../NervousDetail'
import { RetinalImaging } from '../RetinalImaging'

export function BiomarkerDetail({
  organ,
  onSelectClinical,
  onOpenIndex,
}: {
  organ: OrganId
  onSelectClinical: (tab: ClinicalTab) => void
  onOpenIndex: () => void
}) {
  const data = useShowcaseData()
  const def = ORGAN_BY_ID.get(organ)
  if (!def) return null
  if (organ === 'nervous') return <NervousDetail onOpenIndex={onOpenIndex} />
  if (organ === 'brain') return <CognitiveDetail onOpenIndex={onOpenIndex} />
  const measurements = new Set(def.groups.flatMap((group) => group.measurements))
  const labs = data.clinical.labs
  const filtered = { ...labs, rows: labs.rows.filter((row) => measurements.has(row.label)) }
  return (
    <>
      <CardHeader
        title={def.label}
        source={organ === 'eye' ? 'AI-READI documentation images' : 'Clinical labs'}
      />
      {organ === 'eye' ? <RetinalImaging /> : <MeasurementTable view={filtered} />}
      <CardActions
        onOpenIndex={onOpenIndex}
        onOpenLabs={organ === 'eye' ? undefined : () => onSelectClinical('labs')}
      />
    </>
  )
}
