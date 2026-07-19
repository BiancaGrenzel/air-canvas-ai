import type { InteractionStateHandler } from './types'

export function createDraggingState(): InteractionStateHandler {
  return {
    id: 'Dragging',
    update(ctx) {
      if (!ctx.features.present) return 'Lost'
      if (!ctx.features.pinch.active) return 'Released'
      return null
    },
  }
}
