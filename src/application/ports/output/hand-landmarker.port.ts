import type { HandTrackingFrame } from '@/domain'

/**
 * Host-agnostic input for a single detection tick.
 * Adapters may accept richer platform types (e.g. HTMLVideoElement).
 */
export type VisionFrameInput =
  HTMLVideoElement | HTMLCanvasElement | HTMLImageElement | ImageBitmap

export type HandLandmarkerInitOptions = {
  /** Max hands to detect (1–2). Default: 2 */
  numHands?: 1 | 2
  minHandDetectionConfidence?: number
  minHandPresenceConfidence?: number
  minTrackingConfidence?: number
  /** Absolute URL or path to hand_landmarker.task */
  modelAssetPath?: string
  /** Absolute URL to MediaPipe WASM assets */
  wasmPath?: string
}

/**
 * Outbound port for hand landmark inference.
 * Implemented by MediaPipe (web) or future runtimes — never by React.
 */
export interface HandLandmarkerPort {
  initialize(options?: HandLandmarkerInitOptions): Promise<void>

  isReady(): boolean

  detectForVideo(
    frame: VisionFrameInput,
    timestampMs: number,
  ): HandTrackingFrame

  close(): Promise<void>
}
