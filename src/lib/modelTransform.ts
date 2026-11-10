import { Box3, Group, Vector3, type Object3D } from 'three'

interface ModelFit {
  extent: readonly [number, number, number]
  mirrorX: boolean
}

/** Center an asset and fit it uniformly within the supplied dimensions, in metres. */
export function fitOrganModel(model: Object3D, fit: ModelFit): Group {
  const bounds = new Box3().setFromObject(model)
  const center = bounds.getCenter(new Vector3())
  const size = bounds.getSize(new Vector3())
  const scale = Math.min(fit.extent[0] / size.x, fit.extent[1] / size.y, fit.extent[2] / size.z)
  model.position.sub(center)

  const root = new Group()
  root.add(model)
  root.scale.set(fit.mirrorX ? -scale : scale, scale, scale)
  return root
}
