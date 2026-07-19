import type { InteractionStateHandler } from './types'

/**
 * Transient state: one tick after pinch ends, then Hover or Lost.
 */
export function createReleasedState(): InteractionStateHandler {
  return {
    id: 'Released',
    update(ctx) {
      if (!ctx.features.present) return 'Lost'
      if (ctx.features.pinch.active) return 'Pinch'
      return 'Hover'
    },
  }
}
