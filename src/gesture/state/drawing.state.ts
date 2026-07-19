import type { InteractionStateHandler } from './types'

export function createDrawingState(): InteractionStateHandler {
  return {
    id: 'Drawing',
    update(ctx) {
      if (!ctx.features.present) return 'Lost'
      if (!ctx.features.pinch.active) return 'Released'
      return null
    },
  }
}
