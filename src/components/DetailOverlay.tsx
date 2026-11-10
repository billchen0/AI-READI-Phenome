import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
} from 'react'
import type { ActiveView, ClinicalTab, ModalityId, OrganId } from '../types'
import { CardHeader } from './CardHeader'
import { CloseIcon } from './Icons'
import { EnvironmentDetail } from './EnvironmentDetail'
import { IndexPicker } from './details/IndexPicker'
import { ModalityDetail } from './details/ModalityDetail'
import { ClinicalDetail } from './details/ClinicalDetail'
import { BiomarkerDetail } from './details/BiomarkerDetail'

interface Props {
  active: ActiveView | null
  onSelectModality: (id: ModalityId) => void
  onSelectClinical: (tab: ClinicalTab) => void
  onSelectOrgan: (organ: OrganId) => void
  onSelectEnvironment: () => void
  onOpenIndex: () => void
  onClose: () => void
  onClosed: () => void
}

export function DetailOverlay({
  active,
  onSelectModality,
  onSelectClinical,
  onSelectOrgan,
  onSelectEnvironment,
  onOpenIndex,
  onClose,
  onClosed,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (active && !dialog.open) {
      dialog.showModal()
    } else if (!active && dialog.open) {
      dialog.close()
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>('.overlay-title')?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [active])

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault()
      onClose()
    },
    [onClose],
  )

  const handleBackdrop = useCallback(
    (event: ReactMouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) onClose()
    },
    [onClose],
  )

  return (
    <dialog
      ref={dialogRef}
      className="overlay"
      aria-labelledby="overlay-title"
      onCancel={handleCancel}
      onClose={onClosed}
      onClick={handleBackdrop}
    >
      <div className="overlay-panel" onClick={(event) => event.stopPropagation()}>
        <header className="overlay-head">
          <button
            type="button"
            className="icon-button overlay-close"
            onClick={onClose}
            aria-label="Close detail"
            title="Close detail"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="overlay-body">
          {active?.kind === 'index' ? (
            <>
              <CardHeader title="Explore measurements" />
              <IndexPicker
                onSelectModality={onSelectModality}
                onSelectClinical={onSelectClinical}
                onSelectOrgan={onSelectOrgan}
                onSelectEnvironment={onSelectEnvironment}
              />
            </>
          ) : active?.kind === 'clinical' ? (
            <ClinicalDetail tab={active.tab} onOpenIndex={onOpenIndex} />
          ) : active?.kind === 'environment' ? (
            <EnvironmentDetail onOpenIndex={onOpenIndex} />
          ) : active?.kind === 'biomarker' ? (
            <BiomarkerDetail
              organ={active.organ}
              onSelectClinical={onSelectClinical}
              onOpenIndex={onOpenIndex}
            />
          ) : active?.kind === 'detail' ? (
            <ModalityDetail
              modality={active.modality}
              onSelectModality={onSelectModality}
              onOpenIndex={onOpenIndex}
            />
          ) : null}
        </div>
      </div>
    </dialog>
  )
}
