import type { GestureFeatures, HandPose } from '@/domain'

export type FeatureDetectorContext = {
  readonly hand: HandPose
  readonly previous: GestureFeatures | null
  readonly timestampMs: number
}

/**
 * Strategy: extract one aspect of landmark geometry into features.
 * Register new detectors to extend the engine without giant conditionals.
 */
export interface GestureFeatureDetector {
  readonly id: string
  detect(ctx: FeatureDetectorContext, draft: MutableGestureFeatures): void
}

/**
 * Mutable draft assembled by detectors each frame, then frozen.
 */
export type MutableGestureFeatures = {
  present: boolean
  confidence: number
  pointer: { x: number; y: number } | null
  pinch: {
    active: boolean
    distance: number
    strength: number
  }
  pointerDelta: number
  pinchTravel: number
}

export function createFeatureDraft(): MutableGestureFeatures {
  return {
    present: false,
    confidence: 0,
    pointer: null,
    pinch: { active: false, distance: 1, strength: 0 },
    pointerDelta: 0,
    pinchTravel: 0,
  }
}

export function freezeFeatures(draft: MutableGestureFeatures): GestureFeatures {
  return {
    present: draft.present,
    confidence: draft.confidence,
    pointer: draft.pointer ? { ...draft.pointer } : null,
    pinch: { ...draft.pinch },
    pointerDelta: draft.pointerDelta,
    pinchTravel: draft.pinchTravel,
  }
}
