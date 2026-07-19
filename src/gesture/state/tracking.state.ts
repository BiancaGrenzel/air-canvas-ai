import type { InteractionStateHandler } from './types'

export type TrackingStateOptions = {
  /** Frames of continuous presence before promoting to Hover. */
  settleFrames?: number
}

export function createTrackingState(
  options: TrackingStateOptions = {},
): InteractionStateHandler {
  const settleFrames = options.settleFrames ?? 2

  return {
    id: 'Tracking',
    update(ctx) {
      if (!ctx.features.present) return 'Lost'
      if (ctx.framesInState >= settleFrames) return 'Hover'
      return null
    },
  }
}
