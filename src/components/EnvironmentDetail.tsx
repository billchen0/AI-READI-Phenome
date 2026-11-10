import { CardActions } from './CardActions'
import { useShowcaseData } from '../context/ShowcaseData'
import { MeasurementTable } from './MeasurementTable'
import { CardHeader } from './CardHeader'
export function EnvironmentDetail({ onOpenIndex }: { onOpenIndex: () => void }) {
  const data = useShowcaseData()
  return (
    <>
      <CardHeader title="Environment" source="LeeLab Anura" />
      <MeasurementTable view={data.environment} />
      <CardActions onOpenIndex={onOpenIndex} />
    </>
  )
}
