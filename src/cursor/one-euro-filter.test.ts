import { describe, expect, it } from 'vitest'

import { OneEuroFilter1D, oneEuroInternals } from './one-euro-filter'

describe('oneEuroInternals.alpha', () => {
  it('returns a value between 0 and 1 for positive dt/cutoff', () => {
    const a = oneEuroInternals.alpha(1 / 60, 1)
    expect(a).toBeGreaterThan(0)
    expect(a).toBeLessThan(1)
  })

  it('increases when cutoff increases (more responsive)', () => {
    const slow = oneEuroInternals.alpha(1 / 60, 0.5)
    const fast = oneEuroInternals.alpha(1 / 60, 5)
    expect(fast).toBeGreaterThan(slow)
  })
})

describe('OneEuroFilter1D', () => {
  it('returns the first sample unchanged', () => {
    const filter = new OneEuroFilter1D()
    expect(filter.filter(0.42, 0)).toBe(0.42)
  })

  it('keeps a constant signal stable', () => {
    const filter = new OneEuroFilter1D({ minCutoff: 1, beta: 0, dCutoff: 1 })
    filter.filter(0.5, 0)
    const a = filter.filter(0.5, 16)
    const b = filter.filter(0.5, 32)
    expect(a).toBeCloseTo(0.5, 5)
    expect(b).toBeCloseTo(0.5, 5)
  })

  it('smooths a noisy step more than the raw jump on the next frame', () => {
    const filter = new OneEuroFilter1D({
      minCutoff: 1,
      beta: 0,
      dCutoff: 1,
    })
    filter.filter(0, 0)
    const smoothed = filter.filter(1, 16)
    expect(smoothed).toBeGreaterThan(0)
    expect(smoothed).toBeLessThan(1)
  })

  it('ignores non-increasing timestamps and returns previous value', () => {
    const filter = new OneEuroFilter1D()
    filter.filter(0.2, 10)
    const next = filter.filter(0.9, 10)
    expect(next).toBeCloseTo(0.2, 5)
  })

  it('reset clears internal state', () => {
    const filter = new OneEuroFilter1D()
    filter.filter(0.1, 0)
    filter.filter(0.9, 16)
    filter.reset()
    expect(filter.filter(0.55, 0)).toBe(0.55)
  })
})
