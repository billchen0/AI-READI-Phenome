export type Point3 = [number, number, number]

export interface ElectrodeDef {
  label: string
  position: Point3
  normal: Point3
  wire: Point3[]
}

// Patient left is +X (viewer right) on the front-facing mannequin.
export const ECG_JUNCTION: Point3 = [0.145, 1.19, 0.145]

// Surface positions/normals raycast against the delivered GLB. V1/V2 flank
// the sternum, V3 lies between V2/V4; V4–V6 share a horizontal chest level.
export const CHEST_ELECTRODES: ElectrodeDef[] = [
  {
    label: 'V1',
    position: [-0.026868, 1.290588, 0.121974],
    normal: [0.0881, 0.3918, 0.9158],
    wire: [[-0.026163, 1.293722, 0.1293], [-0.0214944, 1.290588, 0.16], ECG_JUNCTION],
  },
  {
    label: 'V2',
    position: [0.030849, 1.290586, 0.122372],
    normal: [-0.1006, 0.3909, 0.9149],
    wire: [[0.030044, 1.293713, 0.129691], [0.0246792, 1.290586, 0.16], ECG_JUNCTION],
  },
  {
    label: 'V3',
    position: [0.064911, 1.260573, 0.138683],
    normal: [-0.0592, 0.3822, 0.9222],
    wire: [[0.064437, 1.263631, 0.146061], [0.0519288, 1.260573, 0.16], ECG_JUNCTION],
  },
  {
    label: 'V4',
    position: [0.100622, 1.23, 0.138962],
    normal: [0.4146, -0.0593, 0.9081],
    wire: [[0.103939, 1.229526, 0.146227], [0.0804976, 1.23, 0.16], ECG_JUNCTION],
  },
  {
    label: 'V5',
    position: [0.146326, 1.23, 0.088595],
    normal: [0.8837, -0.2481, 0.3969],
    wire: [[0.153396, 1.228015, 0.09177], [0.1170608, 1.23, 0.16], ECG_JUNCTION],
  },
  {
    label: 'V6',
    position: [0.155631, 1.23, 0.065468],
    normal: [0.9207, -0.2341, 0.3122],
    wire: [[0.162997, 1.228127, 0.067966], [0.1245048, 1.23, 0.16], ECG_JUNCTION],
  },
]

export const LIMB_ELECTRODES: ElectrodeDef[] = [
  {
    label: 'RA',
    position: [-0.429485, 1.080925, 0.174302],
    normal: [0.3432, 0.6169, 0.7083],
    wire: [[-0.426739, 1.08586, 0.179968], [-0.343588, 1.12, 0.194302], ECG_JUNCTION],
  },
  {
    label: 'LA',
    position: [0.429485, 1.080925, 0.174302],
    normal: [-0.3432, 0.6169, 0.7083],
    wire: [[0.426739, 1.08586, 0.179968], [0.343588, 1.12, 0.194302], ECG_JUNCTION],
  },
  {
    label: 'RL',
    position: [-0.187761, 0.105493, 0.056217],
    normal: [0.1593, 0.3285, 0.931],
    wire: [[-0.186487, 0.108121, 0.063665], [-0.187761, 0.7, 0.16], ECG_JUNCTION],
  },
  {
    label: 'LL',
    position: [0.187761, 0.105493, 0.056217],
    normal: [-0.1593, 0.3285, 0.931],
    wire: [[0.186487, 0.108121, 0.063665], [0.187761, 0.7, 0.16], ECG_JUNCTION],
  },
]

export const ECG_ELECTRODES = [...CHEST_ELECTRODES, ...LIMB_ELECTRODES]
