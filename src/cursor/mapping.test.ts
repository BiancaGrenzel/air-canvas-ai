import { describe, expect, it } from 'vitest'

import {
  applyAcceleration,
  clampToBounds,
  mapCursorInput,
  mapUnitToBounds,
} from './mapping'

describe('applyAcceleration', () => {
  it('is identity when acceleration is 0', () => {
    const point = { x: 0.7, y: 0.3 }
    expect(applyAcceleration(point, 0)).toEqual(point)
  })

  it('amplifies distance from center when acceleration > 0', () => {
    const point = { x: 0.7, y: 0.5 }
    const accelerated = applyAcceleration(point, 1)
    expect(Math.abs(accelerated.x - 0.5)).toBeGreaterThan(
      Math.abs(point.x - 0.5),
    )
  })

  it('leaves the center unchanged', () => {
    expect(applyAcceleration({ x: 0.5, y: 0.5 }, 2)).toEqual({
      x: 0.5,
      y: 0.5,
    })
  })
})

describe('mapUnitToBounds / clampToBounds', () => {
  const bounds = { minX: 100, minY: 50, maxX: 300, maxY: 250 }

  it('maps unit corners into bounds corners', () => {
    expect(mapUnitToBounds({ x: 0, y: 0 }, bounds)).toEqual({
      x: 100,
      y: 50,
    })
    expect(mapUnitToBounds({ x: 1, y: 1 }, bounds)).toEqual({
      x: 300,
      y: 250,
    })
  })

  it('clamps points outside the rectangle', () => {
    expect(clampToBounds({ x: 0, y: 999 }, bounds)).toEqual({
      x: 100,
      y: 250,
    })
  })
})

describe('mapCursorInput', () => {
  const base = {
    mirrored: false,
    sensitivity: 1,
    acceleration: 0,
    bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  }

  it('mirrors X when enabled', () => {
    const normal = mapCursorInput({ x: 0.25, y: 0.4 }, base)
    const mirrored = mapCursorInput(
      { x: 0.25, y: 0.4 },
      { ...base, mirrored: true },
    )
    expect(mirrored.x).toBeCloseTo(1 - normal.x, 5)
    expect(mirrored.y).toBeCloseTo(normal.y, 5)
  })

  it('increases displacement from center with higher sensitivity', () => {
    const low = mapCursorInput({ x: 0.7, y: 0.5 }, { ...base, sensitivity: 1 })
    const high = mapCursorInput({ x: 0.7, y: 0.5 }, { ...base, sensitivity: 2 })
    expect(Math.abs(high.x - 0.5)).toBeGreaterThan(Math.abs(low.x - 0.5))
  })

  it('increases displacement from center with acceleration', () => {
    const linear = mapCursorInput(
      { x: 0.8, y: 0.5 },
      { ...base, acceleration: 0 },
    )
    const accelerated = mapCursorInput(
      { x: 0.8, y: 0.5 },
      { ...base, acceleration: 1 },
    )
    expect(Math.abs(accelerated.x - 0.5)).toBeGreaterThan(
      Math.abs(linear.x - 0.5),
    )
  })
})
