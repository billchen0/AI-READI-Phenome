import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  ECG_DURATION_SECONDS,
  ECG_LEAD_NAMES,
  ECG_SAMPLE_COUNT,
  ECG_SAMPLE_RATE_HZ,
  generateSynthetic12Lead,
} from './fixtures/ecg.ts'

const record = generateSynthetic12Lead()
const byName = new Map<string, (typeof record.leads)[number]>(
  record.leads.map((lead) => [lead.name, lead]),
)

function values(name: string): number[] {
  const lead = byName.get(name)
  assert.ok(lead, `expected lead ${name}`)
  return lead.points.map(([, value]) => value as number)
}

function assertClose(actual: number, expected: number, label: string): void {
  assert.ok(
    Math.abs(actual - expected) <= 0.0016,
    `${label}: expected ${expected.toFixed(4)}, received ${actual.toFixed(4)}`,
  )
}

test('12-lead record exposes the expected names and counts', () => {
  assert.equal(record.leads.length, 12)
  assert.deepEqual(
    record.leads.map((lead) => lead.name),
    [...ECG_LEAD_NAMES],
  )
  assert.equal(record.sampleRate, ECG_SAMPLE_RATE_HZ)
  assert.equal(record.durationSeconds, ECG_DURATION_SECONDS)
  assert.equal(ECG_SAMPLE_COUNT, 601)
})

test('every lead has the same bounded deterministic time base', () => {
  for (const lead of record.leads) {
    assert.equal(lead.points.length, ECG_SAMPLE_COUNT, `${lead.name} sample count`)
    assert.equal(lead.points[0][0], 0)
    assert.equal(lead.points[lead.points.length - 1][0], ECG_DURATION_SECONDS)
    lead.points.forEach(([time, value], index) => {
      assert.equal(time, Number((index / ECG_SAMPLE_RATE_HZ).toFixed(2)))
      assert.equal(typeof value, 'number')
      assert.ok(Number.isFinite(value))
    })
  }
})

test('limb leads follow Einthoven and augmented identities at every sample', () => {
  const leadI = values('I')
  const leadII = values('II')
  const leadIII = values('III')
  const aVR = values('aVR')
  const aVL = values('aVL')
  const aVF = values('aVF')

  for (let index = 0; index < ECG_SAMPLE_COUNT; index += 1) {
    assertClose(leadIII[index], leadII[index] - leadI[index], `III at sample ${index}`)
    assertClose(aVR[index], -(leadI[index] + leadII[index]) / 2, `aVR at sample ${index}`)
    assertClose(aVL[index], leadI[index] - leadII[index] / 2, `aVL at sample ${index}`)
    assertClose(aVF[index], leadII[index] - leadI[index] / 2, `aVF at sample ${index}`)
  }
})

test('precordial leads are distinct and progress from V1 to V6', () => {
  const v1 = values('V1')
  const v2 = values('V2')
  const v3 = values('V3')
  const v4 = values('V4')
  const v5 = values('V5')
  const v6 = values('V6')
  const precordial = [v1, v2, v3, v4, v5, v6]

  for (let left = 0; left < precordial.length; left += 1) {
    for (let right = left + 1; right < precordial.length; right += 1) {
      assert.notDeepEqual(precordial[left], precordial[right])
    }
  }

  assert.ok(Math.max(...v4) > Math.max(...v1), 'V4 R wave should exceed V1')
  assert.ok(Math.max(...v5) > Math.max(...v6), 'V5 R wave should exceed V6')
  assert.ok(Math.min(...v1) < Math.min(...v4), 'V1 S wave should be deeper than V4')
  assert.ok(Math.min(...v2) < Math.min(...v6), 'V2 S wave should be deeper than V6')
})

test('generation is deterministic', () => {
  assert.deepEqual(generateSynthetic12Lead(), record)
})
