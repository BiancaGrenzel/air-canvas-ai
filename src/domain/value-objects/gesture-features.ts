export type PointerPoint = {
  readonly x: number
  readonly y: number
}

export type PinchFeature = {
  readonly active: boolean
  /** Normalized distance thumb tip ↔ index tip (scale-invariant). */
  readonly distance: number
  /** 0 = open, 1 = fully pinched. */
  readonly strength: number
}

/**
 * Geometric / kinematic features extracted from landmarks.
 * Feature detectors (Strategy) produce these — not gesture names.
 */
export type GestureFeatures = {
  readonly present: boolean
  readonly confidence: number
  readonly pointer: PointerPoint | null
  readonly pinch: PinchFeature
  /** Euclidean pointer delta since previous frame (normalized coords). */
  readonly pointerDelta: number
  /** Accumulated travel while current pinch is held. */
  readonly pinchTravel: number
}

export function createIdleGestureFeatures(): GestureFeatures {
  return {
    present: false,
    confidence: 0,
    pointer: null,
    pinch: { active: false, distance: 1, strength: 0 },
    pointerDelta: 0,
    pinchTravel: 0,
  }
}
