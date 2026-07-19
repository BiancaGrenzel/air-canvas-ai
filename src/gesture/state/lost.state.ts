import type { InteractionStateHandler } from './types'

export function createLostState(): InteractionStateHandler {
  return {
    id: 'Lost',
    update(ctx) {
      return ctx.features.present ? 'Tracking' : null
    },
  }
}
