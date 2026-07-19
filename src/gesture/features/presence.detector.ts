import type {
  FeatureDetectorContext,
  GestureFeatureDetector,
  MutableGestureFeatures,
} from './feature-detector'

export type PresenceDetectorOptions = {
  minConfidence?: number
}

export function createPresenceDetector(
  options: PresenceDetectorOptions = {},
): GestureFeatureDetector {
  const minConfidence = options.minConfidence ?? 0.5

  return {
    id: 'presence',
    detect(ctx: FeatureDetectorContext, draft: MutableGestureFeatures) {
      draft.confidence = ctx.hand.confidence
      draft.present = ctx.hand.confidence >= minConfidence
    },
  }
}
