import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { axisTimeTicks, formatAxisTime } from '../src/lib/format.ts'
test('24-hour CGM ticks use seconds throughout and are evenly spaced', () => {
  const ticks = axisTimeTicks(0, 86400)
  assert.deepEqual(ticks, [0, 28800, 57600, 86400])
  assert.deepEqual(
    ticks.map((t) => formatAxisTime(t, 86400)),
    ['0:00', '8:00', '16:00', '24:00'],
  )
})
test('nonzero and short recording windows keep ticks within their extent', () => {
  assert.deepEqual(axisTimeTicks(3600, 7200), [3600, 4800, 6000, 7200])
  assert.equal(formatAxisTime(30, 60), '30.0s')
  assert.deepEqual(axisTimeTicks(1, 1), [])
})
