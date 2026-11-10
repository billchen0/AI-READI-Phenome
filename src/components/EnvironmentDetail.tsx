import { CardActions } from './CardActions'
import { useShowcaseData } from '../context/ShowcaseData'
import { RecordedRows } from './RecordedClinical'
import { CardHeader } from './CardHeader'
const documented = {
  label: 'Environment',
  kind: 'labs' as const,
  note: '',
  caveat: '',
  rows: [
    { label: 'Temperature', value: '23.50', unit: '°C' },
    { label: 'Humidity', value: '49.95', unit: '%' },
    { label: 'PM₂.₅', value: '3.32', unit: 'µg/m³' },
    { label: 'VOC', value: '5', unit: 'index' },
    { label: 'NOx', value: '0', unit: 'index' },
  ],
}
export function EnvironmentDetail({ onOpenIndex }: { onOpenIndex: () => void }) {
  const { data } = useShowcaseData()
  return (
    <>
      <CardHeader title="Environment" source="LeeLab Anura" />
      {!data?.environment ? <p className="card-note">Documentation example values</p> : null}
      <RecordedRows view={data?.environment ?? documented} />
      {!data?.environment ? (
        <p className="card-reference">
          <a
            href="https://docs.aireadi.org/docs/3/dataset/environment/#data-structure"
            target="_blank"
            rel="noreferrer"
          >
            Source: AI-READI data dictionary
          </a>
        </p>
      ) : null}
      <CardActions onOpenIndex={onOpenIndex} />
    </>
  )
}
