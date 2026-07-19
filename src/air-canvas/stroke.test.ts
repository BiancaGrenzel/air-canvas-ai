import { describe, expect, it } from 'vitest'

import { appendStrokePoint, createStroke } from './stroke'

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
})
