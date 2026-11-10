import * as THREE from 'three'

export function createPancreasGeometry() {
  // Continuous tapered gland: broad head on patient right, tail to left.
  const positions: number[] = [],
    indices: number[] = []
  const rings = 48,
    sides = 20
  for (let i = 0; i <= rings; i++) {
    const t = i / rings
    const radius = (0.004 + 0.016 * (1 - t) ** 1.4) * Math.sin(Math.PI * (0.02 + 0.96 * t)) ** 0.25
    for (let j = 0; j <= sides; j++) {
      const angle = (j / sides) * Math.PI * 2
      const fold = 1 + 0.06 * Math.sin(t * 58 + angle * 3)
      positions.push(
        -0.075 + t * 0.16,
        -0.008 + t * 0.025 + Math.cos(angle) * radius * fold,
        Math.sin(angle) * radius * 0.7 * fold,
      )
      if (i < rings && j < sides) {
        const a = i * (sides + 1) + j,
          b = a + sides + 1
        indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }
  }
  const mesh = new THREE.BufferGeometry()
  mesh.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  mesh.setIndex(indices)
  mesh.computeVertexNormals()
  return mesh
}
