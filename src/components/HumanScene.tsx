import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  useGLTF,
} from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'
import { HOTSPOTS, type HotspotDef } from '../data/modalities'
import type { BodyLayer, OrganId } from '../types'
import { CgmDevice, EcgElectrodes, WristBand } from './scene/SensorModels'
import { OrganLayer } from './scene/OrganModels'
import { Hotspot } from './Hotspot'
import { RoomEnvironmentSensor } from './RoomEnvironmentSensor'

// The mannequin uses metres, with the feet at y = 0 and anterior facing +Z.
const MODEL_URL = '/assets/human-base-rigged.glb'
const DEFAULT_CAMERA = new THREE.Vector3(0.36, 0.9, 4.15)
const DEFAULT_TARGET = new THREE.Vector3(0, 0.84, 0)
const MIN_DISTANCE = 2.6
const MAX_DISTANCE = 6.6

export interface StageApi {
  reset: () => void
  zoomIn: () => void
  zoomOut: () => void
}

interface Props {
  environmentLabelRef: MutableRefObject<HTMLButtonElement | null>
  apiRef: MutableRefObject<StageApi | null>
  activeMarker: HotspotDef['id'] | null
  activeOrgan: OrganId | null
  layer: BodyLayer
  onSelectMarker: (def: HotspotDef) => void
  onSelectOrgan: (organ: OrganId) => void
  onSelectEnvironment: () => void
}

export function HumanScene({
  apiRef,
  environmentLabelRef,
  activeMarker,
  activeOrgan,
  layer,
  onSelectMarker,
  onSelectOrgan,
  onSelectEnvironment,
}: Props) {
  const { camera, size } = useThree()
  const environmentPoint = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const label = environmentLabelRef.current
    if (!label) return
    environmentPoint.set(size.width <= 600 ? -0.57 : -0.69, 1.1, 0.03).project(camera)
    label.style.left = `${((environmentPoint.x + 1) * size.width) / 2}px`
    label.style.top = `${((1 - environmentPoint.y) * size.height) / 2}px`
  })
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const { scene } = useGLTF(MODEL_URL)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  const mannequin = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#a8ada8',
        roughness: 0.66,
        metalness: 0,
        clearcoat: 0.1,
        clearcoatRoughness: 0.7,
        sheen: 0.22,
        sheenColor: new THREE.Color('#dfe9e6'),
        sheenRoughness: 0.82,
      }),
    [],
  )

  useEffect(() => {
    const organView = layer === 'organs'
    mannequin.transparent = organView
    mannequin.opacity = organView ? 0.24 : 1
    mannequin.depthWrite = !organView
    mannequin.color.set(organView ? '#9fb6b0' : '#a8ada8')
    mannequin.needsUpdate = true
  }, [layer, mannequin])

  useEffect(() => () => mannequin.dispose(), [mannequin])

  const model = useMemo(() => {
    const copy = cloneSkeleton(scene)
    copy.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.material = mannequin
      child.castShadow = false
      child.receiveShadow = false
      child.frustumCulled = false
      if (!child.geometry.getAttribute('normal')) child.geometry.computeVertexNormals()
    })
    return copy
  }, [scene, mannequin])

  const reset = useCallback(() => {
    camera.position.copy(
      window.matchMedia('(max-width: 600px)').matches
        ? new THREE.Vector3(0.36, 0.9, 4.65)
        : DEFAULT_CAMERA,
    )
    const controls = controlsRef.current
    if (controls) {
      controls.target.copy(DEFAULT_TARGET)
      controls.update()
    }
  }, [camera])

  const zoomBy = useCallback(
    (factor: number) => {
      const controls = controlsRef.current
      if (!controls) return
      const offset = camera.position.clone().sub(controls.target)
      const distance = THREE.MathUtils.clamp(offset.length() * factor, MIN_DISTANCE, MAX_DISTANCE)
      camera.position.copy(controls.target).addScaledVector(offset.normalize(), distance)
      controls.update()
    },
    [camera],
  )

  const zoomIn = useCallback(() => zoomBy(0.86), [zoomBy])
  const zoomOut = useCallback(() => zoomBy(1.16), [zoomBy])

  useEffect(() => {
    apiRef.current = { reset, zoomIn, zoomOut }
    return () => {
      apiRef.current = null
    }
  }, [apiRef, reset, zoomIn, zoomOut])

  return (
    <>
      <ambientLight intensity={0.2} color="#dce5e2" />
      <hemisphereLight args={['#dfe8e4', '#141612', 0.55]} />
      <directionalLight position={[2.7, 3.3, 4.2]} intensity={2.4} color="#e9e9e2" />
      <directionalLight position={[-3.8, 2.7, -0.8]} intensity={3.2} color="#74dce7" />
      <directionalLight position={[-1.7, 2.3, -3.4]} intensity={2.15} color="#d9a567" />

      <Environment resolution={96} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#e7e9e2"
          position={[2.4, 2.8, 3]}
          rotation={[0, -0.5, 0]}
          scale={[3, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#9fe1ea"
          position={[-2.8, 1.6, 2.2]}
          rotation={[0, 0.7, 0]}
          scale={[2.4, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#d7a568"
          position={[0, 2.4, -3.2]}
          rotation={[0, Math.PI, 0]}
          scale={[3, 2.4, 1]}
        />
      </Environment>

      <group>
        <primitive object={model} />
        <RoomEnvironmentSensor onSelect={onSelectEnvironment} />

        {layer === 'sensors' ? (
          <>
            <CgmDevice />
            <WristBand />
            <EcgElectrodes />
          </>
        ) : null}
        <Html position={[0, 0, 0]}>
          <span style={{ display: 'none' }} />
        </Html>
        {layer === 'sensors' ? (
          HOTSPOTS.map((def) => (
            <Hotspot
              key={def.id}
              def={def}
              active={activeMarker === def.id}
              onSelect={onSelectMarker}
            />
          ))
        ) : (
          <Suspense fallback={null}>
            <OrganLayer activeOrgan={activeOrgan} onSelectOrgan={onSelectOrgan} />
          </Suspense>
        )}
      </group>

      <ContactShadows
        position={[0, 0.002, 0]}
        scale={2.6}
        resolution={512}
        blur={2.6}
        opacity={0.48}
        far={1.2}
        frames={1}
        color="#000000"
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[DEFAULT_TARGET.x, DEFAULT_TARGET.y, DEFAULT_TARGET.z]}
        enablePan={false}
        enableDamping={!reducedMotion}
        dampingFactor={0.12}
        rotateSpeed={0.45}
        zoomSpeed={0.8}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI - 0.2}
      />
    </>
  )
}

useGLTF.preload(MODEL_URL)
