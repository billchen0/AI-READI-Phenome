import { CardActions } from '../CardActions'
import { useShowcaseData } from '../../context/ShowcaseData'
import { MODALITY_BY_ID, WRIST_MODALITIES } from '../../data/modalities'
import type { ModalityId } from '../../types'
import { CardHeader } from '../CardHeader'
import { EcgChart } from '../EcgChart'
import { SeriesChart } from '../SeriesChart'
import { SleepTimeline } from '../SleepTimeline'

export function ModalityDetail({
  modality,
  onSelectModality,
  onOpenIndex,
}: {
  modality: ModalityId
  onSelectModality: (id: ModalityId) => void
  onOpenIndex: () => void
}) {
  const def = MODALITY_BY_ID.get(modality)
  const data = useShowcaseData()
  const view = data.modalities[modality]
  if (!def) return null
  const source =
    def.group === 'wrist'
      ? 'Garmin vívosmart 5'
      : modality === 'ecg_12lead'
        ? 'Philips PageWriter TC30'
        : 'Dexcom G6'
  return (
    <>
      <CardHeader title={def.label} source={source} />
      {def.group === 'wrist' ? (
        <div className="wrist-switcher" role="group" aria-label="Wrist monitor metrics">
          {WRIST_MODALITIES.map((candidate) => (
            <button
              key={candidate.id}
              className="chip-button"
              aria-pressed={candidate.id === modality}
              onClick={() => onSelectModality(candidate.id)}
            >
              {candidate.short}
            </button>
          ))}
        </div>
      ) : null}
      {view.kind === 'ecg' ? (
        <EcgChart view={view} />
      ) : view.kind === 'categories' ? (
        <SleepTimeline view={view} />
      ) : (
        <SeriesChart view={view} def={def} />
      )}
      <CardActions onOpenIndex={onOpenIndex} />
    </>
  )
}
