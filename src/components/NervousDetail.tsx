import { CardActions } from './CardActions'
import { useShowcaseData } from '../context/ShowcaseData'
import { MeasurementTable } from './MeasurementTable'
import { CardHeader } from './CardHeader'
export function NervousDetail({ onOpenIndex }: { onOpenIndex: () => void }) {
  const data = useShowcaseData()
  const view = data.clinical.nervous
  const concise = {
    ...view,
    rows: view.rows.map((row) => ({ ...row, label: row.label.split(' · ')[0] })),
  }
  return (
    <>
      <CardHeader title="Peripheral nerves" source="Monofilament test" />
      <MeasurementTable view={concise} />
      <CardActions onOpenIndex={onOpenIndex} />
    </>
  )
}
