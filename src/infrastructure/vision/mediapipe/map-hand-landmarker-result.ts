import type {
  HandLandmarkerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision'

import {
  createHandPose,
  createHandTrackingFrame,
  createLandmark,
  HAND_LANDMARK_COUNT,
  parseHandedness,
  type HandPose,
  type HandTrackingFrame,
} from '@/domain'

export function mapHandLandmarkerResult(
  result: HandLandmarkerResult,
  timestampMs: number,
): HandTrackingFrame {
  const hands: HandPose[] = []
  const count = Math.min(result.landmarks.length, 2)

  for (let index = 0; index < count; index += 1) {
    const landmarks = mapLandmarks(result.landmarks[index] ?? [])
    if (landmarks.length !== HAND_LANDMARK_COUNT) continue

    const handednessCategory = result.handedness[index]?.[0]
    const handedness = parseHandedness(handednessCategory?.categoryName)
    const confidence = handednessCategory?.score ?? 0

    hands.push(
      createHandPose({
        handedness,
        confidence,
        landmarks,
      }),
    )
  }

  return createHandTrackingFrame({ timestampMs, hands })
}

function mapLandmarks(raw: NormalizedLandmark[]) {
  return raw
    .slice(0, HAND_LANDMARK_COUNT)
    .map((landmark) => createLandmark(landmark.x, landmark.y, landmark.z))
}
