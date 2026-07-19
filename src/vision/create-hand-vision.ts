import type { HandLandmarkerPort } from '@/application/ports'
import { isVisionError, VisionError } from '@/domain'
import { createMediaPipeHandLandmarkerAdapter } from '@/infrastructure/vision'

import type {
  CreateHandVisionOptions,
  HandVision,
  HandVisionResultsListener,
  VisionFrameProvider,
} from './types'

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number) => void) => number
  cancelVideoFrameCallback?: (id: number) => void
}

/**
 * Creates an isolated Hand Landmarker vision controller.
 * Public surface: `start` / `stop` / `onResults` only.
 * No React. No rendering.
 */
export function createHandVision(options: CreateHandVisionOptions): HandVision {
  const frameProvider: VisionFrameProvider = options.frameProvider
  const landmarker: HandLandmarkerPort =
    options.landmarker ?? createMediaPipeHandLandmarkerAdapter()
  const onError = options.onError

  const listeners = new Set<HandVisionResultsListener>()

  let running = false
  let starting: Promise<void> | null = null
  let rafId = 0
  let rvfcId: number | null = null
  let activeVideo: VideoWithFrameCallback | null = null

  const emitError = (error: unknown) => {
    const normalized =
      error instanceof Error
        ? error
        : new VisionError('UNKNOWN', 'Unexpected vision error.', error)
    onError?.(normalized)
  }

  const clearLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    if (
      activeVideo &&
      rvfcId !== null &&
      typeof activeVideo.cancelVideoFrameCallback === 'function'
    ) {
      activeVideo.cancelVideoFrameCallback(rvfcId)
    }
    rvfcId = null
    activeVideo = null
  }

  const publish = (timestampMs: number) => {
    if (!running) return

    const frame = frameProvider.getFrame()
    if (!frame) return

    if (frame instanceof HTMLVideoElement) {
      if (frame.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
    }

    try {
      const results = landmarker.detectForVideo(frame, timestampMs)
      for (const listener of listeners) {
        listener(results)
      }
    } catch (error) {
      if (isVisionError(error) && error.code === 'INVALID_FRAME') return
      emitError(error)
    }
  }

  const schedule = () => {
    if (!running) return

    const frame = frameProvider.getFrame()

    if (frame instanceof HTMLVideoElement) {
      const video = frame as VideoWithFrameCallback
      activeVideo = video

      if (typeof video.requestVideoFrameCallback === 'function') {
        const onFrame = (now: number) => {
          if (!running) return
          publish(now)
          rvfcId = video.requestVideoFrameCallback?.(onFrame) ?? null
        }
        rvfcId = video.requestVideoFrameCallback(onFrame)
        return
      }
    }

    const tick = (now: number) => {
      if (!running) return
      publish(now)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  return {
    async start() {
      if (running) return
      if (starting) return starting

      starting = (async () => {
        try {
          if (!landmarker.isReady()) {
            await landmarker.initialize()
          }
          running = true
          schedule()
        } catch (error) {
          running = false
          clearLoop()
          emitError(error)
          throw error instanceof Error
            ? error
            : new VisionError(
                'MODEL_LOAD_FAILED',
                'Failed to start hand vision.',
                error,
              )
        } finally {
          starting = null
        }
      })()

      return starting
    },

    stop() {
      running = false
      starting = null
      clearLoop()
      void landmarker.close()
    },

    onResults(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
