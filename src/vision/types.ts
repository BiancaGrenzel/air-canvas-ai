import type { HandLandmarkerPort } from '@/application/ports'
import type { HandTrackingFrame } from '@/domain'

/**
 * Supplies frames to the vision loop without coupling AI to React or Camera UI.
 */
export type VisionFrameProvider = {
  getFrame: () => HTMLVideoElement | HTMLCanvasElement | null
}

export type HandVisionResults = HandTrackingFrame

export type HandVisionResultsListener = (results: HandVisionResults) => void

export type HandVisionErrorListener = (error: Error) => void

/**
 * Public vision controller — AI orchestration only.
 * Rendering must subscribe via `onResults` outside this module.
 */
export type HandVision = {
  start: () => Promise<void>
  stop: () => void
  onResults: (listener: HandVisionResultsListener) => () => void
}

export type CreateHandVisionOptions = {
  frameProvider: VisionFrameProvider
  /** Inject MediaPipe / fake adapter (DIP). */
  landmarker?: HandLandmarkerPort
  onError?: HandVisionErrorListener
}
