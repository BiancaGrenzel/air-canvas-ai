import type {
  HandLandmarkerInitOptions,
  HandLandmarkerPort,
  VisionFrameInput,
} from '@/application/ports'
import {
  createHandPose,
  createHandTrackingFrame,
  createLandmark,
  HAND_LANDMARK_COUNT,
  VisionError,
  type Handedness,
} from '@/domain'

export type FakeHandLandmarkerAdapterOptions = {
  hands?: Array<{
    handedness: Handedness
    confidence: number
  }>
  failInitialize?: boolean
}

function createFlatLandmarks() {
  return Array.from({ length: HAND_LANDMARK_COUNT }, (_, index) =>
    createLandmark(index / HAND_LANDMARK_COUNT, 0.5, 0),
  )
}

/**
 * Deterministic Hand Landmarker for tests — no MediaPipe / WASM.
 */
export function createFakeHandLandmarkerAdapter(
  config: FakeHandLandmarkerAdapterOptions = {},
): HandLandmarkerPort {
  let ready = false

  return {
    async initialize(initOptions?: HandLandmarkerInitOptions) {
      void initOptions
      if (config.failInitialize) {
        throw new VisionError(
          'MODEL_LOAD_FAILED',
          'Fake Hand Landmarker failed to initialize.',
        )
      }
      ready = true
    },

    isReady() {
      return ready
    },

    detectForVideo(_frame: VisionFrameInput, timestampMs: number) {
      if (!ready) {
        throw new VisionError(
          'NOT_INITIALIZED',
          'Fake Hand Landmarker is not initialized.',
        )
      }

      const specs = config.hands ?? [
        { handedness: 'Right' as const, confidence: 0.92 },
        { handedness: 'Left' as const, confidence: 0.88 },
      ]

      const hands = specs.slice(0, 2).map((spec) =>
        createHandPose({
          handedness: spec.handedness,
          confidence: spec.confidence,
          landmarks: createFlatLandmarks(),
        }),
      )

      return createHandTrackingFrame({ timestampMs, hands })
    },

    async close() {
      ready = false
    },
  }
}
