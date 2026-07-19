import type { InteractionStateHandler, PinchMotionStrategy } from './types'

export function createPinchState(
  motionStrategy: PinchMotionStrategy,
): InteractionStateHandler {
  return {
    id: 'Pinch',
    update(ctx) {
      if (!ctx.features.present) return 'Lost'
      if (!ctx.features.pinch.active) return 'Released'
      const next = motionStrategy.resolve(ctx)
      return next === 'Pinch' ? null : next
    },
  }
}
