import type { InteractionStateHandler } from './types'

export type DrawingStateOptions = {
  /**
   * Keep Drawing after pinch flickers off / brief tracking loss.
   * At ~30 FPS, 20 frames ≈ 650ms.
   */
  releaseGraceFrames?: number
  /** Tolerate brief hand-confidence dips without going Lost. */
  presenceGraceFrames?: number
}

const lostPinchFramesByTrack = new Map<string, number>()
const lostPresenceFramesByTrack = new Map<string, number>()

export function createDrawingState(
  options: DrawingStateOptions = {},
): InteractionStateHandler {
  const releaseGraceFrames = options.releaseGraceFrames ?? 20
  const presenceGraceFrames = options.presenceGraceFrames ?? 8

  return {
    id: 'Drawing',
    enter(ctx) {
      lostPinchFramesByTrack.set(ctx.trackId, 0)
      lostPresenceFramesByTrack.set(ctx.trackId, 0)
    },
    exit(ctx) {
      lostPinchFramesByTrack.delete(ctx.trackId)
      lostPresenceFramesByTrack.delete(ctx.trackId)
    },
    update(ctx) {
      if (!ctx.features.present) {
        const lostPresence =
          (lostPresenceFramesByTrack.get(ctx.trackId) ?? 0) + 1
        lostPresenceFramesByTrack.set(ctx.trackId, lostPresence)
        if (lostPresence > presenceGraceFrames) return 'Lost'
        // Stay in Drawing through a short confidence dip.
        return null
      }
      lostPresenceFramesByTrack.set(ctx.trackId, 0)

      // Soft hold: nearly-pinched still counts while drawing.
      const pinchHeld =
        ctx.features.pinch.active || ctx.features.pinch.strength >= 0.35

      if (pinchHeld) {
        lostPinchFramesByTrack.set(ctx.trackId, 0)
        return null
      }

      const lost = (lostPinchFramesByTrack.get(ctx.trackId) ?? 0) + 1
      lostPinchFramesByTrack.set(ctx.trackId, lost)
      if (lost <= releaseGraceFrames) return null

      return 'Released'
    },
  }
}
