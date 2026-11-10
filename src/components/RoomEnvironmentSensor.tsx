import { RoundedBox } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

/** Conceptual tabletop housing: the AI-READI documentation does not provide a CAD model. */
export function RoomEnvironmentSensor({ onSelect }: { onSelect: () => void }) {
  const compact = useThree(({ size }) => size.width <= 600)
  return (
    <group
      position={[compact ? -0.57 : -0.69, 0, 0.03]}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      <mesh position={[0, 0.018, 0]} receiveShadow>
        <cylinderGeometry args={[0.105, 0.105, 0.025, 48]} />
        <meshStandardMaterial color="#28332f" roughness={0.77} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.447, 0]}>
        <cylinderGeometry args={[0.012, 0.015, 0.846, 24]} />
        <meshStandardMaterial color="#66726d" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.878, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.022, 48]} />
        <meshStandardMaterial color="#485752" roughness={0.6} metalness={0.35} />
      </mesh>
      <RoundedBox
        args={[0.135, 0.16, 0.095]}
        radius={0.015}
        smoothness={4}
        position={[0, 0.971, 0]}
      >
        <meshPhysicalMaterial color="#b8bdb3" roughness={0.58} metalness={0.04} clearcoat={0.12} />
      </RoundedBox>
      {[-0.035, -0.022, -0.009, 0.004, 0.017].map((x) => (
        <mesh key={x} position={[x, 0.984, 0.048]}>
          <boxGeometry args={[0.005, 0.044, 0.002]} />
          <meshStandardMaterial color="#33423d" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 1.033, 0.049]}>
        <circleGeometry args={[0.006, 20]} />
        <meshStandardMaterial color="#6ed5cd" emissive="#3ab5ad" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}
