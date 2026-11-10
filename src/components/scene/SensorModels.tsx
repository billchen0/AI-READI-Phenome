import { useEffect, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import {
  ECG_ELECTRODES,
  ECG_JUNCTION,
  type ElectrodeDef,
  type Point3 as Point,
} from '../../data/anatomy'
import { CGM_DEVICE, WRIST_DEVICE } from '../../data/modalities'

const Z_AXIS = new THREE.Vector3(0, 0, 1)

const CGM_POSITION = new THREE.Vector3(...CGM_DEVICE.position)
const CGM_OUTWARD = new THREE.Vector3(...CGM_DEVICE.outward).normalize()

const WRIST_CENTER = new THREE.Vector3(...WRIST_DEVICE.center)
const WRIST_ARM = new THREE.Vector3(...WRIST_DEVICE.axis).normalize()
const WRIST_OUTWARD = new THREE.Vector3(...WRIST_DEVICE.outward).normalize()

function orientation(normal: Point): THREE.Quaternion {
  return new THREE.Quaternion().setFromUnitVectors(Z_AXIS, new THREE.Vector3(...normal).normalize())
}

function LeadWire({ points }: { points: Point[] }) {
  const geometry = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))),
        28,
        0.0018,
        6,
        false,
      ),
    [points],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#5f8882"
        roughness={0.76}
        metalness={0.05}
        transparent
        opacity={0.86}
      />
    </mesh>
  )
}

function Electrode({ def }: { def: ElectrodeDef }) {
  const quaternion = useMemo(() => orientation(def.normal), [def.normal])

  return (
    <group position={def.position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[0.0155, 32]} />
        <meshStandardMaterial color="#eee9dc" roughness={0.68} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.0042]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0062, 0.0072, 0.006, 24]} />
        <meshStandardMaterial
          color="#324845"
          metalness={0.2}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function CgmDevice() {
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(Z_AXIS, CGM_OUTWARD),
    [],
  )

  return (
    <>
      <group position={CGM_POSITION} quaternion={quaternion}>
        {/* Libre Pro–style round adhesive and low-profile upper-arm sensor. */}
        <mesh position={[0, 0, 0.0005]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.0014, 48]} />
          <meshPhysicalMaterial color="#e5ddd0" roughness={0.88} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.0021]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.0185, 0.0195, 0.0048, 48]} />
          <meshPhysicalMaterial
            color="#e9e6dc"
            roughness={0.58}
            metalness={0.02}
            clearcoat={0.16}
          />
        </mesh>
        <mesh position={[0, 0, 0.0046]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.0152, 0.00055, 8, 48]} />
          <meshStandardMaterial color="#c2beb3" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0, 0.0048]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.0058, 0.0058, 0.0006, 32]} />
          <meshStandardMaterial color="#c8c9c3" roughness={0.64} />
        </mesh>
      </group>
    </>
  )
}

export function WristBand() {
  const frame = useMemo(() => {
    const outward = WRIST_OUTWARD.clone()
      .addScaledVector(WRIST_ARM, -WRIST_OUTWARD.dot(WRIST_ARM))
      .normalize()
    const bandSide = new THREE.Vector3().crossVectors(outward, WRIST_ARM).normalize()
    const tangent = new THREE.Vector3().crossVectors(WRIST_ARM, outward).normalize()
    return {
      bandQuaternion: new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(bandSide, outward, WRIST_ARM),
      ),
      sensorQuaternion: new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(tangent, WRIST_ARM, outward),
      ),
      sensorPosition: WRIST_CENTER.clone().addScaledVector(outward, WRIST_DEVICE.moduleOffset),
    }
  }, [])

  return (
    <>
      <group position={WRIST_CENTER} quaternion={frame.bandQuaternion}>
        <mesh scale={[WRIST_DEVICE.strapWidthScale, 1, WRIST_DEVICE.strapThicknessScale]}>
          <torusGeometry args={[WRIST_DEVICE.strapRadius, WRIST_DEVICE.strapTube, 12, 36]} />
          <meshStandardMaterial color="#171b1a" roughness={0.8} />
        </mesh>
      </group>
      <group position={frame.sensorPosition} quaternion={frame.sensorQuaternion}>
        <RoundedBox args={[0.0195, 0.041, 0.0107]} radius={0.004} smoothness={4}>
          <meshStandardMaterial color="#202524" roughness={0.66} metalness={0.12} />
        </RoundedBox>
        <mesh position={[0, 0.003, 0.0056]}>
          <planeGeometry args={[0.0108, 0.0207]} />
          <meshStandardMaterial
            color="#080e0e"
            emissive="#182524"
            emissiveIntensity={0.2}
            roughness={0.4}
          />
        </mesh>
        {/* Recessed physical button below the narrow OLED display. */}
        <RoundedBox
          position={[0, -0.013, 0.0058]}
          args={[0.009, 0.005, 0.001]}
          radius={0.002}
          smoothness={3}
        >
          <meshStandardMaterial color="#3b4543" roughness={0.65} />
        </RoundedBox>
        {[-0.003, 0.001, 0.005].map((y, index) => (
          <mesh key={y} position={[0, y, 0.0059]}>
            <planeGeometry args={[index === 1 ? 0.006 : 0.004, 0.001]} />
            <meshBasicMaterial color="#d8ece7" />
          </mesh>
        ))}
      </group>
    </>
  )
}

export function EcgElectrodes() {
  return (
    <group>
      {ECG_ELECTRODES.map((def) => (
        <Electrode key={def.label} def={def} />
      ))}
      {ECG_ELECTRODES.map((def) =>
        def.wire ? <LeadWire key={`${def.label}-wire`} points={def.wire} /> : null,
      )}
      <mesh position={ECG_JUNCTION}>
        <boxGeometry args={[0.026, 0.034, 0.012]} />
        <meshStandardMaterial color="#556a65" roughness={0.72} metalness={0.1} />
      </mesh>
      <LeadWire
        points={[ECG_JUNCTION, [0.15, 1.12, 0.112], [0.158, 1.04, 0.1], [0.164, 1.005, 0.082]]}
      />
    </group>
  )
}
