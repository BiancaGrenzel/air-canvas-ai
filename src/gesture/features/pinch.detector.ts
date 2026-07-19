import { HandLandmarkIndex } from '@/domain'

import { clamp01, distance2d, midpoint2d } from '../math'
import type {
  FeatureDetectorContext,
  GestureFeatureDetector,
  MutableGestureFeatures,
} from './feature-detector'

export type PinchDetectorOptions = {
  /** Normalized distance below which pinch is active. */
  activateBelow?: number
  /** Hysteresis: release above this distance. */
  releaseAbove?: number
}

export function createPinchDetector(
  options: PinchDetectorOptions = {},
): GestureFeatureDetector {
  const activateBelow = options.activateBelow ?? 0.045
  const releaseAbove = options.releaseAbove ?? 0.07

  return {
    id: 'pinch',
    detect(ctx: FeatureDetectorContext, draft: MutableGestureFeatures) {
      const thumb = ctx.hand.landmarks[HandLandmarkIndex.THUMB_TIP]
      const index = ctx.hand.landmarks[HandLandmarkIndex.INDEX_FINGER_TIP]
      const wrist = ctx.hand.landmarks[HandLandmarkIndex.WRIST]
      const middleMcp = ctx.hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_MCP]

      if (!thumb || !index || !wrist || !middleMcp) {
        draft.pinch = { active: false, distance: 1, strength: 0 }
        return
      }

      const handScale = Math.max(distance2d(wrist, middleMcp), 0.05)
      const raw = distance2d(thumb, index)
      const distance = raw / handScale
      const wasActive = ctx.previous?.pinch.active ?? false

      const active = wasActive
        ? distance <= releaseAbove
        : distance <= activateBelow

      const strength = clamp01(1 - distance / releaseAbove)

      draft.pinch = { active, distance, strength }

      // Prefer pinch midpoint as pointer while pinching.
      if (active) {
        draft.pointer = midpoint2d(thumb, index)
      }
    },
  }
}
