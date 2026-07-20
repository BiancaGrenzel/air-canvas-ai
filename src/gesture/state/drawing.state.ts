import type { InteractionStateHandler } from './types'

export type DrawingStateOptions = {
  /**
   * Keep Drawing for a few frames after pinch flickers off.
   * Keep this short so intentional release feels immediate.
   */
  releaseGraceFrames?: number
  /** Tolerate brief hand-confidence dips without going Lost. */
  presenceGraceFrames?: number
  /** Frames of rising pinch distance before ending Drawing (release flick). */
  openingFrames?: number
}

const lostPinchFramesByTrack = new Map<string, number>()
const lostPresenceFramesByTrack = new Map<string, number>()
const prevPinchDistanceByTrack = new Map<string, number>()
const openingFramesByTrack = new Map<string, number>()

export function createDrawingState(
  options: DrawingStateOptions = {},
): InteractionStateHandler {
  const releaseGraceFrames = options.releaseGraceFrames ?? 4
  const presenceGraceFrames = options.presenceGraceFrames ?? 6
  const openingFramesToRelease = options.openingFrames ?? 2

  return {
    id: 'Drawing',
    enter(ctx) {
      lostPinchFramesByTrack.set(ctx.trackId, 0)
      lostPresenceFramesByTrack.set(ctx.trackId, 0)
      openingFramesByTrack.set(ctx.trackId, 0)
      prevPinchDistanceByTrack.set(ctx.trackId, ctx.features.pinch.distance)
    },
    exit(ctx) {
      lostPinchFramesByTrack.delete(ctx.trackId)
      lostPresenceFramesByTrack.delete(ctx.trackId)
      prevPinchDistanceByTrack.delete(ctx.trackId)
      openingFramesByTrack.delete(ctx.trackId)
    },
    update(ctx) {
      if (!ctx.features.present) {
        const lostPresence =
          (lostPresenceFramesByTrack.get(ctx.trackId) ?? 0) + 1
        lostPresenceFramesByTrack.set(ctx.trackId, lostPresence)
        if (lostPresence > presenceGraceFrames) return 'Lost'
        return null
      }
      lostPresenceFramesByTrack.set(ctx.trackId, 0)

      const distance = ctx.features.pinch.distance
      const prevDistance = prevPinchDistanceByTrack.get(ctx.trackId)
      prevPinchDistanceByTrack.set(ctx.trackId, distance)

      // Opening the pinch: distance rises before active flips false.
      // Ignore jitter while the pinch is still firmly closed — otherwise a
      // fast upward stroke (index leading) falsely ends Drawing mid-line.
      const firmlyPinched =
        ctx.features.pinch.active && ctx.features.pinch.strength >= 0.45
      if (
        !firmlyPinched &&
        prevDistance !== undefined &&
        distance > prevDistance + 0.012
      ) {
        const opening = (openingFramesByTrack.get(ctx.trackId) ?? 0) + 1
        openingFramesByTrack.set(ctx.trackId, opening)
        if (
          opening >= openingFramesToRelease ||
          (!ctx.features.pinch.active && opening >= 1)
        ) {
          return 'Released'
        }
      } else if (firmlyPinched || distance <= (prevDistance ?? distance)) {
        openingFramesByTrack.set(ctx.trackId, 0)
      }

      if (ctx.features.pinch.active) {
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
