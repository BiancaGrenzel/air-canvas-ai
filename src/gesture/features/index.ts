import {
  createFeatureDraft,
  freezeFeatures,
  type FeatureDetectorContext,
  type GestureFeatureDetector,
} from './feature-detector'
import { createMotionDetector } from './motion.detector'
import {
  createPinchDetector,
  type PinchDetectorOptions,
} from './pinch.detector'
import { createPointerDetector } from './pointer.detector'
import { createPresenceDetector } from './presence.detector'

export type {
  FeatureDetectorContext,
  GestureFeatureDetector,
  MutableGestureFeatures,
} from './feature-detector'

export { createFeatureDraft, freezeFeatures } from './feature-detector'

export { createPresenceDetector } from './presence.detector'
export { createPinchDetector } from './pinch.detector'
export type { PinchDetectorOptions } from './pinch.detector'
export { createPointerDetector } from './pointer.detector'
export { createMotionDetector } from './motion.detector'

export function createDefaultFeatureDetectors(
  options: { pinch?: PinchDetectorOptions } = {},
): GestureFeatureDetector[] {
  return [
    createPresenceDetector(),
    createPinchDetector(options.pinch),
    createPointerDetector(),
    createMotionDetector(),
  ]
}

export function runFeatureDetectors(
  detectors: readonly GestureFeatureDetector[],
  ctx: FeatureDetectorContext,
) {
  const draft = createFeatureDraft()
  for (const detector of detectors) {
    detector.detect(ctx, draft)
  }
  return freezeFeatures(draft)
}
