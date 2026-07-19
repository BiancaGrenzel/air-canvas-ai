import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarker as HandLandmarkerType,
} from '@mediapipe/tasks-vision'

import type {
  HandLandmarkerInitOptions,
  HandLandmarkerPort,
  VisionFrameInput,
} from '@/application/ports'
import { VisionError } from '@/domain'

import { mapHandLandmarkerResult } from './map-hand-landmarker-result'

const DEFAULT_NUM_HANDS = 2
const DEFAULT_MODEL_ASSET_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
const DEFAULT_WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'

export type MediaPipeHandLandmarkerAdapterOptions = HandLandmarkerInitOptions

export function createMediaPipeHandLandmarkerAdapter(
  defaults: MediaPipeHandLandmarkerAdapterOptions = {},
): HandLandmarkerPort {
  let landmarker: HandLandmarkerType | null = null
  let ready = false
  let lastTimestampMs = -1

  const resolveOptions = (
    options: HandLandmarkerInitOptions = {},
  ): Required<
    Pick<
      HandLandmarkerInitOptions,
      | 'numHands'
      | 'minHandDetectionConfidence'
      | 'minHandPresenceConfidence'
      | 'minTrackingConfidence'
      | 'modelAssetPath'
      | 'wasmPath'
    >
  > => ({
    numHands: options.numHands ?? defaults.numHands ?? DEFAULT_NUM_HANDS,
    minHandDetectionConfidence:
      options.minHandDetectionConfidence ??
      defaults.minHandDetectionConfidence ??
      0.5,
    minHandPresenceConfidence:
      options.minHandPresenceConfidence ??
      defaults.minHandPresenceConfidence ??
      0.5,
    minTrackingConfidence:
      options.minTrackingConfidence ?? defaults.minTrackingConfidence ?? 0.5,
    modelAssetPath:
      options.modelAssetPath ??
      defaults.modelAssetPath ??
      DEFAULT_MODEL_ASSET_PATH,
    wasmPath: options.wasmPath ?? defaults.wasmPath ?? DEFAULT_WASM_PATH,
  })

  return {
    async initialize(options = {}) {
      if (ready && landmarker) return

      const resolved = resolveOptions(options)

      try {
        const vision = await FilesetResolver.forVisionTasks(resolved.wasmPath)
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: resolved.modelAssetPath,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: resolved.numHands,
            minHandDetectionConfidence: resolved.minHandDetectionConfidence,
            minHandPresenceConfidence: resolved.minHandPresenceConfidence,
            minTrackingConfidence: resolved.minTrackingConfidence,
          })
        } catch {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: resolved.modelAssetPath,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: resolved.numHands,
            minHandDetectionConfidence: resolved.minHandDetectionConfidence,
            minHandPresenceConfidence: resolved.minHandPresenceConfidence,
            minTrackingConfidence: resolved.minTrackingConfidence,
          })
        }
        ready = true
        lastTimestampMs = -1
      } catch (error) {
        landmarker = null
        ready = false
        throw new VisionError(
          'MODEL_LOAD_FAILED',
          'Failed to initialize MediaPipe Hand Landmarker.',
          error,
        )
      }
    },

    isReady() {
      return ready && landmarker !== null
    },

    detectForVideo(frame: VisionFrameInput, timestampMs: number) {
      if (!landmarker || !ready) {
        throw new VisionError(
          'NOT_INITIALIZED',
          'Hand Landmarker must be initialized before detection.',
        )
      }

      if (!isValidFrame(frame)) {
        throw new VisionError(
          'INVALID_FRAME',
          'Vision frame is not ready for detection.',
        )
      }

      // MediaPipe requires strictly increasing timestamps per landmarker instance.
      const safeTimestamp =
        timestampMs <= lastTimestampMs ? lastTimestampMs + 1 : timestampMs
      lastTimestampMs = safeTimestamp

      try {
        const result = landmarker.detectForVideo(frame, safeTimestamp)
        return mapHandLandmarkerResult(result, safeTimestamp)
      } catch (error) {
        throw new VisionError(
          'DETECTION_FAILED',
          'Hand landmark detection failed.',
          error,
        )
      }
    },

    async close() {
      try {
        landmarker?.close()
      } finally {
        landmarker = null
        ready = false
        lastTimestampMs = -1
      }
    },
  }
}

function isValidFrame(frame: VisionFrameInput): boolean {
  if (frame instanceof HTMLVideoElement) {
    return frame.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
  }

  if (frame instanceof HTMLImageElement) {
    return frame.complete && frame.naturalWidth > 0
  }

  if (frame instanceof HTMLCanvasElement) {
    return frame.width > 0 && frame.height > 0
  }

  return Boolean(frame)
}
