import { HandLandmarkIndex } from '@/domain'

import type {
  FeatureDetectorContext,
  GestureFeatureDetector,
  MutableGestureFeatures,
} from './feature-detector'

/**
 * Sets pointer to index fingertip when not already set (e.g. by pinch).
 */
export function createPointerDetector(): GestureFeatureDetector {
  return {
    id: 'pointer',
    detect(ctx: FeatureDetectorContext, draft: MutableGestureFeatures) {
      if (draft.pointer) return

      const tip = ctx.hand.landmarks[HandLandmarkIndex.INDEX_FINGER_TIP]
      if (!tip) {
        draft.pointer = null
        return
      }

      draft.pointer = { x: tip.x, y: tip.y }
    },
  }
}
