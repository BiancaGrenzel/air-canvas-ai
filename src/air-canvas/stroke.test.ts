import { describe, expect, it } from 'vitest'

import { appendStrokePoint, createStroke, trimReleaseFlick } from './stroke'

describe('stroke model', () => {
  it('creates a stroke with the first point', () => {
    const stroke = createStroke(
      { tool: 'brush', color: '#000', thickness: 4 },
      { x: 0.1, y: 0.2 },
    )
    expect(stroke.points).toHaveLength(1)
    expect(stroke.points[0]).toEqual({ x: 0.1, y: 0.2 })
    expect(stroke.style.tool).toBe('brush')
  })

  it('appends distinct points', () => {
    const stroke = createStroke(
      { tool: 'brush', color: '#000', thickness: 4 },
      { x: 0.1, y: 0.2 },
    )
    const next = appendStrokePoint(stroke, { x: 0.2, y: 0.3 })
    expect(next.points).toHaveLength(2)
  })

  it('ignores duplicate consecutive points', () => {
    const stroke = createStroke(
      { tool: 'eraser', color: '#000', thickness: 8 },
      { x: 0.5, y: 0.5 },
    )
    const next = appendStrokePoint(stroke, { x: 0.5, y: 0.5 })
    expect(next).toBe(stroke)
  })

  it('trims an upward release flick at the end of a horizontal stroke', () => {
    let stroke = createStroke(
      { tool: 'brush', color: '#000', thickness: 4 },
      { x: 0.1, y: 0.5 },
    )
    for (let i = 1; i <= 12; i += 1) {
      stroke = appendStrokePoint(stroke, { x: 0.1 + i * 0.05, y: 0.5 })
    }
    // Release flick upward
    stroke = appendStrokePoint(stroke, { x: 0.7, y: 0.42 })
    stroke = appendStrokePoint(stroke, { x: 0.7, y: 0.3 })
    stroke = appendStrokePoint(stroke, { x: 0.71, y: 0.18 })

    const trimmed = trimReleaseFlick(stroke)
    const last = trimmed.points[trimmed.points.length - 1]
    expect(trimmed.points.length).toBeLessThan(stroke.points.length)
    expect(last?.y).toBeGreaterThan(0.4)
  })

  it('keeps an intentional upward stroke intact', () => {
    let stroke = createStroke(
      { tool: 'brush', color: '#000', thickness: 4 },
      { x: 0.5, y: 0.85 },
    )
    for (let i = 1; i <= 14; i += 1) {
      stroke = appendStrokePoint(stroke, { x: 0.5, y: 0.85 - i * 0.04 })
    }

    const trimmed = trimReleaseFlick(stroke)
    expect(trimmed.points).toHaveLength(stroke.points.length)
    expect(trimmed.points[trimmed.points.length - 1]?.y).toBeCloseTo(0.29)
  })
})
