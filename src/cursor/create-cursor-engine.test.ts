import { describe, expect, it } from 'vitest'

import { createCursorEngine } from './create-cursor-engine'

describe('createCursorEngine', () => {
  it('returns null position before the first update', () => {
    const engine = createCursorEngine({ mirrored: false, acceleration: 0 })
    expect(engine.getPosition()).toBeNull()
  })

  it('maps the first sample and exposes getPosition', () => {
    const engine = createCursorEngine({
      mirrored: false,
      sensitivity: 1,
      acceleration: 0,
      bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
    })

    const point = engine.update({ x: 0.5, y: 0.5, timestampMs: 0 })
    expect(point.x).toBeCloseTo(50, 5)
    expect(point.y).toBeCloseTo(50, 5)
    expect(engine.getPosition()).toEqual(point)
  })

  it('keeps output inside configured bounds', () => {
    const engine = createCursorEngine({
      mirrored: false,
      sensitivity: 5,
      acceleration: 3,
      bounds: { minX: 10, minY: 20, maxX: 90, maxY: 80 },
      oneEuro: { minCutoff: 10, beta: 1, dCutoff: 1 },
    })

    for (let i = 0; i < 30; i += 1) {
      const point = engine.update({
        x: i % 2 === 0 ? 0 : 1,
        y: i % 2 === 0 ? 1 : 0,
        timestampMs: i * 16,
      })
      expect(point.x).toBeGreaterThanOrEqual(10)
      expect(point.x).toBeLessThanOrEqual(90)
      expect(point.y).toBeGreaterThanOrEqual(20)
      expect(point.y).toBeLessThanOrEqual(80)
    }
  })

  it('respects sensitivity via setConfig', () => {
    const engine = createCursorEngine({
      mirrored: false,
      sensitivity: 1,
      acceleration: 0,
      oneEuro: { minCutoff: 100, beta: 0, dCutoff: 1 },
    })

    engine.update({ x: 0.7, y: 0.5, timestampMs: 0 })
    const mild = engine.update({ x: 0.7, y: 0.5, timestampMs: 16 })

    engine.reset()
    engine.setConfig({ sensitivity: 2 })
    engine.update({ x: 0.7, y: 0.5, timestampMs: 0 })
    const strong = engine.update({ x: 0.7, y: 0.5, timestampMs: 16 })

    expect(Math.abs(strong.x - 0.5)).toBeGreaterThan(Math.abs(mild.x - 0.5))
  })

  it('reset clears smoothed state', () => {
    const engine = createCursorEngine({
      mirrored: false,
      sensitivity: 1,
      acceleration: 0,
    })
    engine.update({ x: 0.1, y: 0.1, timestampMs: 0 })
    engine.update({ x: 0.9, y: 0.9, timestampMs: 16 })
    engine.reset()
    expect(engine.getPosition()).toBeNull()
    const again = engine.update({ x: 0.4, y: 0.6, timestampMs: 0 })
    expect(again.x).toBeCloseTo(0.4, 5)
    expect(again.y).toBeCloseTo(0.6, 5)
  })
})
