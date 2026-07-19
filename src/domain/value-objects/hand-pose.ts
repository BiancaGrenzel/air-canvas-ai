import type { Handedness } from '../enums/handedness'
import type { Landmark } from './landmark'
import { HAND_LANDMARK_COUNT } from './landmark'

export type HandPose = {
  readonly handedness: Handedness
  /** Confidence for handedness classification (0–1). */
  readonly confidence: number
  /** Exactly 21 MediaPipe hand landmarks in image-normalized coordinates. */
  readonly landmarks: readonly Landmark[]
}

export function createHandPose(input: {
  handedness: Handedness
  confidence: number
  landmarks: readonly Landmark[]
}): HandPose {
  if (input.landmarks.length !== HAND_LANDMARK_COUNT) {
    throw new Error(
      `HandPose requires ${HAND_LANDMARK_COUNT} landmarks, received ${input.landmarks.length}.`,
    )
  }

  return {
    handedness: input.handedness,
    confidence: clamp01(input.confidence),
    landmarks: input.landmarks,
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(1, Math.max(0, value))
}
