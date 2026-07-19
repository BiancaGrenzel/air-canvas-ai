import { describe, expect, it } from 'vitest'

import { resolveDrawAction } from './interaction'

describe('resolveDrawAction', () => {
  it('begins drawing when entering Drawing with a point', () => {
    expect(resolveDrawAction('Hover', 'Drawing', true)).toBe('begin')
    expect(resolveDrawAction('Pinch', 'Drawing', true)).toBe('begin')
    expect(resolveDrawAction(null, 'Drawing', true)).toBe('begin')
  })

  it('continues while remaining in Drawing with a point', () => {
    expect(resolveDrawAction('Drawing', 'Drawing', true)).toBe('continue')
  })

  it('ends drawing when leaving Drawing for Hover', () => {
    expect(resolveDrawAction('Drawing', 'Hover', true)).toBe('end')
    expect(resolveDrawAction('Drawing', 'Hover', false)).toBe('end')
  })

  it('ends drawing for any non-Drawing state after Drawing', () => {
    expect(resolveDrawAction('Drawing', 'Released', false)).toBe('end')
    expect(resolveDrawAction('Drawing', 'Lost', false)).toBe('end')
    expect(resolveDrawAction('Drawing', 'Pinch', true)).toBe('end')
  })

  it('does nothing when Drawing without a point on first frame', () => {
    expect(resolveDrawAction('Hover', 'Drawing', false)).toBe('none')
  })

  it('does nothing while hovering without an active stroke', () => {
    expect(resolveDrawAction('Hover', 'Hover', true)).toBe('none')
    expect(resolveDrawAction('Lost', 'Tracking', true)).toBe('none')
  })
})
