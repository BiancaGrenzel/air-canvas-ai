import type {
  FeatureDetectorContext,
  GestureFeatureDetector,
  MutableGestureFeatures,
} from './feature-detector'

/**
 * Computes pointer delta and accumulates pinch travel from previous features.
 */
export function createMotionDetector(): GestureFeatureDetector {
  return {
    id: 'motion',
    detect(ctx: FeatureDetectorContext, draft: MutableGestureFeatures) {
      const prev = ctx.previous
      const current = draft.pointer

      if (!prev?.pointer || !current) {
        draft.pointerDelta = 0
        draft.pinchTravel = 0
        return
      }

      const dx = current.x - prev.pointer.x
      const dy = current.y - prev.pointer.y
      const delta = Math.hypot(dx, dy)
      draft.pointerDelta = delta

      if (draft.pinch.active) {
        draft.pinchTravel = (prev.pinch.active ? prev.pinchTravel : 0) + delta
      } else {
        draft.pinchTravel = 0
      }
    },
  }
}
