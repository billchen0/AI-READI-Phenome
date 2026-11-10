import { useMemo, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { Html } from '@react-three/drei'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { CGM_DEVICE, WRIST_DEVICE } from '../data/modalities'
import type { HotspotDef } from '../data/modalities'

interface Props {
  def: HotspotDef
  active: boolean
  onSelect: (def: HotspotDef) => void
}

const Z_INDEX_RANGE: [number, number] = [30, 5]

export function Hotspot({ def, active, onSelect }: Props) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const facing = useMemo(
    () => ({
      position: new Vector3(...def.position),
      normal: new Vector3(
        ...(def.id === 'cgm' ? CGM_DEVICE.outward : WRIST_DEVICE.outward),
      ).normalize(),
      direction: new Vector3(),
    }),
    [def],
  )
  // These rigid attachment sites have known normals. Avoid raycasting the
  // 70k-vertex skinned mannequin for every HTML marker on every orbit frame.
  useFrame(({ camera }) => {
    if (!button.current || def.id === 'chest') return
    const visible =
      facing.direction.copy(camera.position).sub(facing.position).dot(facing.normal) > 0.005
    button.current.style.visibility = visible ? 'visible' : 'hidden'
  })

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    start.current = { x: event.clientX, y: event.clientY }
    event.stopPropagation()
  }

  function handleClick(event: ReactPointerEvent<HTMLButtonElement>) {
    const origin = start.current
    start.current = null
    if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 6) return
    onSelect(def)
  }

  return (
    <Html
      position={def.position}
      center
      zIndexRange={Z_INDEX_RANGE}
      wrapperClass="hotspot-anchor"
      occlude={false}
    >
      <button
        ref={button}
        type="button"
        className={`hotspot hotspot--${def.side}${active ? ' is-active' : ''}`}
        aria-pressed={active}
        aria-haspopup="dialog"
        aria-label={def.ariaLabel}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <span className="hotspot-dot" aria-hidden="true" />
        <span className="hotspot-label" aria-hidden="true">
          {def.label}
        </span>
      </button>
    </Html>
  )
}
