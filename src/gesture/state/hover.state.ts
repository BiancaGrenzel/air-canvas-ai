import type { InteractionStateHandler } from './types'

export function createHoverState(): InteractionStateHandler {
  return {
    id: 'Hover',
    update(ctx) {
      if (!ctx.features.present) return 'Lost'
      if (ctx.features.pinch.active) return 'Pinch'
      return null
    },
  }
}
