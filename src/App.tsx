import { useCallback, useRef, useState } from 'react'
import { BodyStage } from './components/BodyStage'
import { DetailOverlay } from './components/DetailOverlay'
import { MODALITY_BY_ID, markerForModality, type HotspotDef } from './data/modalities'
import { ORGAN_BY_ID } from './data/organs'
import type { ActiveView, BodyLayer, ClinicalTab, MarkerId, ModalityId, OrganId } from './types'

export default function App() {
  const [active, setActive] = useState<ActiveView | null>(null)
  const [layer, setLayer] = useState<BodyLayer>('sensors')
  const [announcement, setAnnouncement] = useState('')
  const openerRef = useRef<HTMLElement | null>(null)

  const openView = useCallback(
    (next: ActiveView, message: string) => {
      if (active === null) {
        openerRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null
      }
      setActive(next)
      setAnnouncement(message)
    },
    [active],
  )

  const selectModality = useCallback(
    (id: ModalityId) => {
      const def = MODALITY_BY_ID.get(id)
      setLayer('sensors')
      openView({ kind: 'detail', modality: id }, `Opened ${def?.label ?? 'modality'}.`)
    },
    [openView],
  )

  const selectClinical = useCallback(
    (tab: ClinicalTab) => {
      openView(
        { kind: 'clinical', tab },
        `Opened ${tab === 'labs' ? 'clinical labs' : tab === 'retinal' ? 'retinal imaging' : 'surveys'}.`,
      )
    },
    [openView],
  )

  const selectEnvironment = useCallback(() => {
    openView({ kind: 'environment' }, 'Opened room environmental sensor signals.')
  }, [openView])

  const selectOrgan = useCallback(
    (organ: OrganId) => {
      const def = ORGAN_BY_ID.get(organ)
      setLayer('organs')
      openView({ kind: 'biomarker', organ }, `Opened ${def?.label ?? 'organ'} biomarker context.`)
    },
    [openView],
  )

  const openIndex = useCallback(() => {
    openView({ kind: 'index' }, 'Opened the complete modality list.')
  }, [openView])

  const selectMarker = useCallback(
    (def: HotspotDef) => {
      selectModality(def.modality)
    },
    [selectModality],
  )

  const closeView = useCallback(() => {
    setActive(null)
    setAnnouncement('Closed detail and returned to the body.')
  }, [])

  const handleClosed = useCallback(() => {
    const opener = openerRef.current
    openerRef.current = null
    opener?.focus()
  }, [])

  const activeMarker: MarkerId | null =
    active?.kind === 'detail' ? markerForModality(active.modality) : null
  const activeOrgan: OrganId | null = active?.kind === 'biomarker' ? active.organ : null

  return (
    <div className="app">
      <a className="skip-link" href="#scene-body">
        Skip to the body
      </a>

      <main className="scene">
        <header className="scene-header">
          <h1 className="brand">
            AI-READI <span>PHENOME</span>
          </h1>
        </header>

        <BodyStage
          activeMarker={activeMarker}
          activeOrgan={activeOrgan}
          layer={layer}
          onSelectMarker={selectMarker}
          onSelectOrgan={selectOrgan}
          onSelectEnvironment={selectEnvironment}
          onOpenIndex={openIndex}
        />

        <div className="scene-actions">
          <div className="layer-switch" role="group" aria-label="Body layer">
            <button
              type="button"
              aria-pressed={layer === 'sensors'}
              onClick={() => setLayer('sensors')}
            >
              Sensors
            </button>
            <button
              type="button"
              aria-pressed={layer === 'organs'}
              onClick={() => setLayer('organs')}
            >
              Organs
            </button>
          </div>
          <button type="button" className="quiet-button" onClick={openIndex}>
            All modalities
          </button>
        </div>
      </main>

      <DetailOverlay
        active={active}
        onSelectModality={selectModality}
        onSelectClinical={selectClinical}
        onSelectOrgan={selectOrgan}
        onSelectEnvironment={selectEnvironment}
        onOpenIndex={openIndex}
        onClose={closeView}
        onClosed={handleClosed}
      />

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
