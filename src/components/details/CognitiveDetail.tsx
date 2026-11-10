import { CardActions } from '../CardActions'
import { CardHeader } from '../CardHeader'
import { RecordedRows } from '../RecordedClinical'
import { useShowcaseData } from '../../context/ShowcaseData'

export function CognitiveDetail({ onOpenIndex }: { onOpenIndex: () => void }) {
  const { data } = useShowcaseData()
  return (
    <>
      <CardHeader title="Brain / cognition" source="Montreal Cognitive Assessment (MoCA)" />
      <RecordedRows view={data?.clinical?.cognitive} />
      <p className="card-reference">
        <a href="https://mocacognition.com/faq" target="_blank" rel="noreferrer">
          MoCA · official task and scoring reference
        </a>
      </p>
      <CardActions onOpenIndex={onOpenIndex} />
    </>
  )
}
