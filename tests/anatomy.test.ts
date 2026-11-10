import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { CHEST_ELECTRODES, ECG_ELECTRODES, LIMB_ELECTRODES } from '../src/data/anatomy.ts'
import {
  CGM_DEVICE,
  CGM_HOTSPOT,
  CLINICAL_TABS,
  HOTSPOTS,
  WRIST_DEVICE,
  WRIST_HOTSPOT,
} from '../src/data/modalities.ts'
import { ORGAN_BY_ID, ORGANS } from '../src/data/organs.ts'

function subtract(a: readonly number[], b: readonly number[]) {
  return a.map((value, index) => value - b[index])
}

function dot(a: readonly number[], b: readonly number[]) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0)
}

function length(a: readonly number[]) {
  return Math.sqrt(dot(a, a))
}

test('ECG exposes ten distinct electrodes with a descending precordial arc', () => {
  assert.equal(ECG_ELECTRODES.length, 10)
  assert.equal(new Set(ECG_ELECTRODES.map(({ label }) => label)).size, 10)
  assert.deepEqual(
    CHEST_ELECTRODES.map(({ label }) => label),
    ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'],
  )
  assert.ok(CHEST_ELECTRODES[3].position[1] < CHEST_ELECTRODES[0].position[1], 'V4 is below V1')
  assert.equal(CHEST_ELECTRODES[3].position[1], CHEST_ELECTRODES[4].position[1])
  assert.equal(CHEST_ELECTRODES[4].position[1], CHEST_ELECTRODES[5].position[1])
  assert.ok(
    CHEST_ELECTRODES[5].position[0] > CHEST_ELECTRODES[4].position[0],
    'V6 extends toward patient-left axilla (+X)',
  )
  assert.ok(
    CHEST_ELECTRODES.every(({ wire, position }) => wire[0][2] > position[2]),
    'wire starts ahead of each pad',
  )
})

test('limb electrodes are separated pairs on forearms and near ankles', () => {
  assert.deepEqual(
    LIMB_ELECTRODES.map(({ label }) => label),
    ['RA', 'LA', 'RL', 'LL'],
  )
  const [ra, la, rl, ll] = LIMB_ELECTRODES
  assert.ok(ra.position[0] < 0 && la.position[0] > 0)
  assert.ok(ra.position[1] > 1 && la.position[1] > 1)
  assert.ok(rl.position[1] < 0.15 && ll.position[1] < 0.15)
})

test('retina has no metabolic measurements; glucose and HbA1c remain metabolic', () => {
  assert.equal(ORGANS.length, 7)
  const eye = ORGAN_BY_ID.get('eye')
  assert.ok(eye)
  assert.ok(eye.position[1] > 1.5)
  assert.deepEqual(eye.groups, [])
  assert.ok(
    ORGAN_BY_ID.get('metabolic')
      ?.groups.flatMap((group) => group.measurements)
      .includes('HbA1c'),
  )
  assert.ok(CLINICAL_TABS.some(({ id }) => id === 'retinal'))
})

test('lungs are absent from the organ catalog', () => {
  assert.ok(ORGANS.every((organ) => String(organ.id) !== 'lungs'))
})

test('CGM sits on the posterior anatomical-left upper arm with an outward normal', () => {
  const cgm = HOTSPOTS.find(({ id }) => id === 'cgm')
  assert.ok(cgm)
  assert.deepEqual(cgm.position, CGM_HOTSPOT)
  assert.ok(CGM_DEVICE.position[0] > 0, 'anatomical left is +X')
  assert.ok(CGM_DEVICE.position[2] < 0, 'posterior is -Z')
  assert.ok(CGM_DEVICE.outward[2] < -0.9, 'puck faces away from the triceps surface')
  assert.ok(CGM_DEVICE.outward[0] > 0, 'outward normal follows the lateral arm')

  const shoulder = [0.1851, 1.3392, 0.0185]
  const elbow = [0.3445, 1.1563, 0.0166]
  const arm = subtract(elbow, shoulder)
  const along = dot(subtract(CGM_DEVICE.position, shoulder), arm) / dot(arm, arm)
  assert.ok(along > 0.45 && along < 0.7, 'puck sits mid-triceps between shoulder and elbow')

  const hotspotOffset = subtract(CGM_HOTSPOT, CGM_DEVICE.position)
  assert.ok(Math.abs(dot(hotspotOffset, CGM_DEVICE.outward) - 0.012) < 0.0005)
  assert.ok(
    length(
      subtract(
        hotspotOffset,
        CGM_DEVICE.outward.map((value) => value * 0.012),
      ),
    ) < 0.0005,
  )
})

test('wrist band and hotspot sit at the distal wrist immediately proximal to the hand', () => {
  const wrist = HOTSPOTS.find(({ id }) => id === 'wrist')
  assert.ok(wrist)
  assert.deepEqual(wrist.position, WRIST_HOTSPOT)

  const elbow = [0.3445, 1.1563, 0.0166]
  const hand = [0.4723, 1.0347, 0.1974]
  const forearm = subtract(hand, elbow)
  const axis = forearm.map((value) => value / length(forearm))
  const along = dot(subtract(WRIST_DEVICE.center, elbow), axis)

  assert.ok(along / length(forearm) > 0.86, 'band is in the distal forearm, not mid-forearm')
  assert.ok(along / length(forearm) < 1, 'band remains proximal to the hand joint')
  assert.ok(
    length(subtract(WRIST_DEVICE.center, hand)) < 0.035,
    'band is immediately proximal to the hand',
  )
  assert.ok(
    Math.abs(dot(subtract(wrist.position, WRIST_DEVICE.center), axis)) < 0.001,
    'hotspot follows the wrist cross-section',
  )

  const sensorOffset = length(subtract(wrist.position, WRIST_DEVICE.center))
  assert.ok(sensorOffset > WRIST_DEVICE.moduleOffset, 'hotspot is on the outward sensor face')
  assert.ok(sensorOffset < WRIST_DEVICE.moduleOffset + 0.006)
})
