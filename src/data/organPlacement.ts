// Metres in the mannequin frame: +X patient left, +Y superior, +Z anterior.
// Extents include vessels/ureters where present. These are display-registration
// constraints, not subject-specific organ measurements.
export const ORGAN_FITS = {
  brain: { url: '/assets/organ-brain.glb', extent: [0.116, 0.108, 0.142], mirrorX: false },
  heart: { url: '/assets/organ-heart.glb', extent: [0.14, 0.178, 0.1], mirrorX: false },
  liver: { url: '/assets/organ-liver.glb', extent: [0.23, 0.1, 0.11], mirrorX: true },
  kidneys: { url: '/assets/organ-kidneys.glb', extent: [0.19, 0.19, 0.04], mirrorX: true },
} as const
