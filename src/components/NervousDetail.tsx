import { CardActions } from './CardActions'
import { useShowcaseData } from '../context/ShowcaseData'
import { RecordedRows } from './RecordedClinical'
import { CardHeader } from './CardHeader'
export function NervousDetail({ onOpenIndex }: { onOpenIndex: () => void }) {
  const { data } = useShowcaseData()
  const view = data?.clinical?.nervous
  const concise = view
    ? { ...view, rows: view.rows.map((row) => ({ ...row, label: row.label.split(' · ')[0] })) }
    : undefined
  return (
    <>
      <CardHeader title="Peripheral nerves" source="Monofilament test" />
      <RecordedRows view={concise} />
      <CardActions onOpenIndex={onOpenIndex} />
    </>
  )
}
