import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ORGAN_BY_ID } from '../src/data/organs.ts'
import { ORGAN_FITS } from '../src/data/organPlacement.ts'

test('organ locations preserve anatomical laterality and relative depth', () => {
  const p = (id: 'heart' | 'liver' | 'brain' | 'metabolic' | 'kidneys') =>
    ORGAN_BY_ID.get(id)!.position
  assert.ok(p('heart')[0] > 0, 'heart centered slightly to patient left')
  assert.ok(p('liver')[0] < 0, 'liver centered toward patient right')
  assert.ok(p('heart')[1] > p('liver')[1], 'heart superior to liver')
  assert.ok(p('kidneys')[2] < p('liver')[2], 'kidneys posterior to liver')
  assert.ok(p('metabolic')[2] < p('liver')[2], 'pancreas posterior to liver')
  assert.ok(
    p('brain')[1] > 1.59 && p('brain')[1] < 1.63,
    'brain in cranial rather than facial or scalp region',
  )
  assert.ok(p('brain')[2] > 0.03 && p('brain')[2] < 0.07, 'brain follows forward head offset')
  assert.equal(ORGAN_FITS.kidneys.mirrorX, true, 'asset left/right convention adapted to mannequin')
})
