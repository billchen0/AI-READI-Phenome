import { useEffect, useMemo } from 'react'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { fitOrganModel } from '../../lib/modelTransform'
import { createPancreasGeometry } from '../../lib/organGeometry'
import { ORGAN_FITS } from '../../data/organPlacement'
import { ORGANS, type OrganDef } from '../../data/organs'
import type { Point3 as Point } from '../../data/anatomy'
import type { OrganId } from '../../types'

function ModelOrgan({ id }: { id: keyof typeof ORGAN_FITS }) {
  const fit = ORGAN_FITS[id]
  const { scene } = useGLTF(fit.url)
  const model = useMemo(() => fitOrganModel(scene.clone(true), fit), [scene, fit])
  return <primitive object={model} dispose={null} />
}

function PancreasModel() {
  const geometry = useMemo(createPancreasGeometry, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#c5a172" roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
  )
}

function PeripheralNerves() {
  const geometries = useMemo(() => {
    const paths: Point[][] = []
    for (const side of [-1, 1]) {
      paths.push([
        [side * 0.04, 1.02, -0.025],
        [side * 0.12, 0.86, -0.04],
        [side * 0.16, 0.61, -0.035],
        [side * 0.17, 0.42, -0.025],
        [side * 0.18, 0.17, 0.005],
        [side * 0.19, 0.055, 0.11],
      ])
      paths.push([
        [side * 0.16, 0.61, -0.035],
        [side * 0.2, 0.43, -0.005],
        [side * 0.21, 0.19, 0.02],
        [side * 0.22, 0.05, 0.12],
      ])
      for (const toe of [-0.02, 0, 0.02])
        paths.push([
          [side * 0.19, 0.12, 0.05],
          [side * (0.19 + toe), 0.06, 0.12],
          [side * (0.19 + toe), 0.035, 0.17],
        ])
    }
    return paths.map(
      (points) =>
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
          36,
          0.0018,
          7,
          false,
        ),
    )
  }, [])
  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries])
  return (
    <group>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshStandardMaterial
            color="#e3bc70"
            emissive="#9a6b25"
            emissiveIntensity={0.45}
            roughness={0.65}
          />
        </mesh>
      ))}
    </group>
  )
}

function OrganMesh({ organ }: { organ: OrganDef }) {
  if (organ.id in ORGAN_FITS) return <ModelOrgan id={organ.id as keyof typeof ORGAN_FITS} />
  if (organ.id === 'metabolic') return <PancreasModel />
  return null
}

export function OrganLayer({
  activeOrgan,
  onSelectOrgan,
}: {
  activeOrgan: OrganId | null
  onSelectOrgan: (organ: OrganId) => void
}) {
  return (
    <group>
      <PeripheralNerves />
      {ORGANS.map((organ) => (
        <group key={organ.id} position={organ.position}>
          {organ.id !== 'eye' && organ.id !== 'nervous' ? <OrganMesh organ={organ} /> : null}
          <Html
            center
            position={organ.hotspotOffset ?? [0, 0, 0.055]}
            wrapperClass="organ-hotspot-anchor"
            zIndexRange={[24, 6]}
          >
            <button
              type="button"
              className={`organ-hotspot organ-hotspot--${organ.side} organ-hotspot--${organ.id}${activeOrgan === organ.id ? ' is-active' : ''}`}
              aria-pressed={activeOrgan === organ.id}
              aria-haspopup="dialog"
              aria-label={`Open ${organ.label} biomarker context`}
              onClick={() => onSelectOrgan(organ.id)}
            >
              <span className="organ-dot" aria-hidden="true" />
              <span className="organ-label" aria-hidden="true">
                {organ.short}
              </span>
            </button>
          </Html>
        </group>
      ))}
    </group>
  )
}
