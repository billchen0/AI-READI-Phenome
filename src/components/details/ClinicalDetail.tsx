import { CardActions } from '../CardActions'
import { useShowcaseData } from '../../context/ShowcaseData'
import type { ClinicalTab } from '../../types'
import { CardHeader } from '../CardHeader'
import { RecordedRows } from '../RecordedClinical'
import { RetinalImaging } from '../RetinalImaging'

export function ClinicalDetail({
  tab,
  onOpenIndex,
}: {
  tab: ClinicalTab
  onOpenIndex: () => void
}) {
  const { data } = useShowcaseData()
  return (
    <>
      <CardHeader
        title={
          tab === 'retinal' ? 'Retinal imaging' : tab === 'labs' ? 'Clinical labs' : 'Survey scores'
        }
        source={tab === 'retinal' ? 'AI-READI documentation examples' : undefined}
      />
      {tab === 'retinal' ? <RetinalImaging /> : <RecordedRows view={data?.clinical?.[tab]} />}
      <CardActions onOpenIndex={onOpenIndex} />
    </>
  )
}
