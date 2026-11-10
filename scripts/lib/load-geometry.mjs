import { readFile } from 'node:fs/promises'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/** Load mesh geometry in Node without a browser image decoder. */
export async function loadGeometryModel(filename) {
  const file = await readFile(filename)
  const jsonLength = file.readUInt32LE(12)
  const document = JSON.parse(file.subarray(20, 20 + jsonLength).toString())

  delete document.images
  delete document.textures
  for (const material of document.materials ?? []) {
    removeTextureProperties(material)
    removeTextureProperties(material.pbrMetallicRoughness ?? {})
  }

  const json = Buffer.from(JSON.stringify(document))
  const padding = Buffer.alloc((4 - (json.length % 4)) % 4, ' ')
  const jsonChunk = Buffer.concat([json, padding])
  const binaryChunk = file.subarray(20 + jsonLength)
  const header = Buffer.alloc(20)
  header.write('glTF')
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(header.length + jsonChunk.length + binaryChunk.length, 8)
  header.writeUInt32LE(jsonChunk.length, 12)
  header.writeUInt32LE(0x4e4f534a, 16)

  const buffer = Buffer.concat([header, jsonChunk, binaryChunk])
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  const { scene } = await new GLTFLoader().parseAsync(arrayBuffer, '')
  scene.updateMatrixWorld(true)
  scene.traverse((object) => {
    if (object.isSkinnedMesh) object.skeleton.update()
  })
  return scene
}

function removeTextureProperties(material) {
  for (const key of Object.keys(material)) {
    if (key.toLowerCase().includes('texture')) delete material[key]
  }
}
