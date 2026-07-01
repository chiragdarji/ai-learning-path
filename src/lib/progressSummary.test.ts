import { describe, it, expect } from 'vitest'
import { phaseProgress, nextResource, overallProgress } from './progressSummary'

const done = new Set(['r1'])
const isComplete = (id: string) => done.has(id)

describe('phaseProgress', () => {
  it('returns per-phase done/total/pct for the full track', () => {
    const rows = phaseProgress('full', isComplete)
    expect(rows.length).toBeGreaterThan(0)
    const row = rows[0]
    expect(row).toHaveProperty('phaseId')
    expect(row).toHaveProperty('pct')
    expect(row.total).toBeGreaterThan(0)
    expect(row.done).toBeLessThanOrEqual(row.total)
  })
})

describe('overallProgress', () => {
  it('aggregates done and total across the track', () => {
    const o = overallProgress('full', isComplete)
    expect(o.total).toBeGreaterThan(0)
    expect(o.pct).toBe(Math.round((o.done / o.total) * 100))
  })
})

describe('nextResource', () => {
  it('returns the first incomplete resource in track order', () => {
    const next = nextResource('full', () => false)
    expect(next).not.toBeNull()
    expect(next).toHaveProperty('id')
    expect(next).toHaveProperty('url')
    expect(next).toHaveProperty('phaseId')
  })

  it('returns null when everything is complete', () => {
    const next = nextResource('full', () => true)
    expect(next).toBeNull()
  })
})
