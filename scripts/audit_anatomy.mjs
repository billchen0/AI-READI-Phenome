import * as THREE from 'three'
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh'
import { ORGAN_FITS } from '../src/data/organPlacement.ts'
import { ORGAN_BY_ID } from '../src/data/organs.ts'
import { createPancreasGeometry } from '../src/lib/organGeometry.ts'
import { fitOrganModel } from '../src/lib/modelTransform.ts'
import { loadGeometryModel } from './lib/load-geometry.mjs'

const ASSET_DIRECTORY = new URL('../public/assets/', import.meta.url)
const SKIN_CLEARANCE = 0.002

function assetPath(filename) {
  return new URL(filename, ASSET_DIRECTORY)
}

function getMeshes(scene) {
  const meshes = []
  scene.traverse((object) => {
    if (object.isMesh) meshes.push(object)
  })
  return meshes
}

/** Freeze the rigged mannequin in world space before querying its surface. */
function bakeSkinMesh(source) {
  const geometry = source.geometry.clone()
  const position = geometry.attributes.position
  const vertex = new THREE.Vector3()
  for (let index = 0; index < position.count; index++) {
    source.getVertexPosition(index, vertex).applyMatrix4(source.matrixWorld)
    position.setXYZ(index, vertex.x, vertex.y, vertex.z)
  }
  geometry.boundsTree = new MeshBVH(geometry)
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
  mesh.raycast = acceleratedRaycast
  return mesh
}

function isInsideSkin(point, skinMeshes) {
  const front = new THREE.Raycaster(
    new THREE.Vector3(point.x, point.y, 0.6),
    new THREE.Vector3(0, 0, -1),
  )
  const back = new THREE.Raycaster(
    new THREE.Vector3(point.x, point.y, -0.6),
    new THREE.Vector3(0, 0, 1),
  )
  const anterior = front.intersectObjects(skinMeshes)[0]
  const posterior = back.intersectObjects(skinMeshes)[0]
  return Boolean(
    anterior &&
      posterior &&
      point.z <= anterior.point.z - SKIN_CLEARANCE &&
      point.z >= posterior.point.z + SKIN_CLEARANCE,
  )
}

function checkContainment(id, meshes, skinMeshes) {
  let vertexCount = 0
  let containedCount = 0
  for (const mesh of meshes) {
    const vertex = new THREE.Vector3()
    for (let index = 0; index < mesh.geometry.attributes.position.count; index++) {
      mesh.getVertexPosition(index, vertex).applyMatrix4(mesh.matrixWorld)
      vertexCount++
      if (isInsideSkin(vertex, skinMeshes)) containedCount++
    }
    mesh.geometry.boundsTree = new MeshBVH(mesh.geometry)
  }
  return { id, vertexCount, containedCount, passed: vertexCount === containedCount }
}

function checkIntersections(firstMeshes, secondMeshes) {
  const intersections = []
  for (const first of firstMeshes) {
    for (const second of secondMeshes) {
      const firstBounds = new THREE.Box3().setFromObject(first)
      const secondBounds = new THREE.Box3().setFromObject(second)
      if (!firstBounds.intersectsBox(secondBounds)) continue
      const relativeTransform = first.matrixWorld.clone().invert().multiply(second.matrixWorld)
      if (first.geometry.boundsTree.intersectsGeometry(second.geometry, relativeTransform)) {
        intersections.push([first.name, second.name])
      }
    }
  }
  return intersections
}

async function main() {
  const mannequin = await loadGeometryModel(assetPath('human-base-rigged.glb'))
  const skinMeshes = getMeshes(mannequin).map(bakeSkinMesh)
  const organs = new Map()

  for (const [id, fit] of Object.entries(ORGAN_FITS)) {
    const scene = await loadGeometryModel(assetPath(fit.url.split('/').at(-1)))
    const model = fitOrganModel(scene, fit)
    model.position.fromArray(ORGAN_BY_ID.get(id).position)
    model.updateMatrixWorld(true)
    organs.set(id, getMeshes(model))
  }

  const pancreas = new THREE.Mesh(createPancreasGeometry())
  pancreas.position.fromArray(ORGAN_BY_ID.get('metabolic').position)
  pancreas.updateMatrixWorld(true)
  organs.set('metabolic', [pancreas])

  const containment = [...organs].map(([id, meshes]) => checkContainment(id, meshes, skinMeshes))
  const collisions = []
  const ids = [...organs.keys()]
  for (let index = 0; index < ids.length; index++) {
    for (const second of ids.slice(index + 1)) {
      const first = ids[index]
      const surfaces = checkIntersections(organs.get(first), organs.get(second))
      if (surfaces.length) collisions.push({ first, second, surfaces })
    }
  }

  console.log(
    JSON.stringify({ skinClearanceMetres: SKIN_CLEARANCE, containment, collisions }, null, 2),
  )
  if (containment.some((result) => !result.passed) || collisions.length) process.exitCode = 1
}

await main()
