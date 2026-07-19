import type { HandPose } from '../value-objects/hand-pose'

export type HandTrackingFrame = {
  readonly timestampMs: number
  readonly hands: readonly HandPose[]
}

export function createHandTrackingFrame(input: {
  timestampMs: number
  hands: readonly HandPose[]
}): HandTrackingFrame {
  return {
    timestampMs: input.timestampMs,
    hands: input.hands.slice(0, 2),
  }
}
