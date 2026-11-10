import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ErrorBoundary } from './ErrorBoundary'
import { HumanScene, type StageApi } from './HumanScene'
import { ResetIcon, ZoomInIcon, ZoomOutIcon } from './Icons'
import type { HotspotDef } from '../data/modalities'
import type { BodyLayer, OrganId } from '../types'

interface Props {
  activeMarker: HotspotDef['id'] | null
  activeOrgan: OrganId | null
  layer: BodyLayer
  onSelectMarker: (def: HotspotDef) => void
  onSelectOrgan: (organ: OrganId) => void
  onSelectEnvironment: () => void
  onOpenIndex: () => void
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

function StageFallback({ message, onOpenIndex }: { message: string; onOpenIndex: () => void }) {
  return (
    <div className="stage-fallback" role="status">
      <p className="eyebrow">3D view unavailable</p>
      <h2>The synthetic mannequin could not be displayed.</h2>
      <p>{message}</p>
      <button type="button" className="quiet-button" onClick={onOpenIndex}>
        Browse all modalities
      </button>
    </div>
  )
}

export function BodyStage({
  activeMarker,
  activeOrgan,
  layer,
  onSelectMarker,
  onSelectOrgan,
  onSelectEnvironment,
  onOpenIndex,
}: Props) {
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const compact = window.matchMedia('(max-width: 600px)').matches
  const environmentLabelRef = useRef<HTMLButtonElement | null>(null)
  const apiRef = useRef<StageApi | null>(null)

  useEffect(() => {
    setWebgl(supportsWebGL())
  }, [])

  return (
    <section
      id="scene-body"
      className="stage"
      tabIndex={-1}
      aria-label="Interactive synthetic mannequin with sensor markers"
    >
      <p className="sr-only">
        A smooth, neutral synthetic mannequin shows where measurements are collected. In Sensors
        mode, three markers are available as buttons: chest ECG, upper-arm continuous glucose
        monitor, and wrist monitor. Ten electrode pads appear in Sensors mode: V1 to V6 across the
        chest and RA, LA, RL, and LL on the limbs. An adjacent tabletop sensor opens room
        environment signals; it is not worn or linked to this mannequin. In Organs mode, heart,
        brain, kidneys, liver, pancreas, peripheral nerves at the foot, and eye/retina regions
        expose contextual groupings. All nine wearable and ECG modalities, room environment signals,
        retinal imaging, organ context, clinical labs, and surveys are also available from the All
        modalities control.
      </p>

      {webgl === null ? (
        <div className="stage-loading" role="status">
          <span className="loading-line" aria-hidden="true" />
          Preparing 3D view
        </div>
      ) : null}

      {webgl === false ? (
        <StageFallback
          message="This browser does not expose WebGL. The complete, keyboard-operable modality list remains available."
          onOpenIndex={onOpenIndex}
        />
      ) : null}

      {webgl ? (
        <button
          ref={environmentLabelRef}
          className="environment-hotspot"
          aria-label="Open environmental sensor measurements"
          onClick={onSelectEnvironment}
        >
          Environment
        </button>
      ) : null}
      {webgl ? (
        <ErrorBoundary
          fallback={
            <StageFallback
              message="The mannequin asset could not be loaded. The complete modality list remains available."
              onOpenIndex={onOpenIndex}
            />
          }
        >
          <Canvas
            className="stage-canvas"
            dpr={[1, 1.5]}
            camera={{
              position: compact ? [0.36, 0.9, 4.65] : [0.36, 0.9, 4.15],
              fov: compact ? 38 : 34,
              near: 0.05,
              far: 30,
            }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.setClearAlpha(0)
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 0.96
            }}
          >
            <Suspense fallback={null}>
              <HumanScene
                environmentLabelRef={environmentLabelRef}
                apiRef={apiRef}
                activeMarker={activeMarker}
                activeOrgan={activeOrgan}
                layer={layer}
                onSelectMarker={onSelectMarker}
                onSelectOrgan={onSelectOrgan}
                onSelectEnvironment={onSelectEnvironment}
              />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      ) : null}

      <div className="stage-toolbar" role="group" aria-label="3D view controls">
        <button
          type="button"
          className="icon-button"
          onClick={() => apiRef.current?.zoomOut()}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOutIcon />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => apiRef.current?.zoomIn()}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomInIcon />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => apiRef.current?.reset()}
          aria-label="Reset 3D view"
          title="Reset view"
        >
          <ResetIcon />
        </button>
      </div>
    </section>
  )
}
