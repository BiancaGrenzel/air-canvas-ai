import type {
  CameraAdapter,
  CameraStreamHandle,
  OpenCameraOptions,
  OpenedCamera,
} from '@/application/ports'
import {
  CameraError,
  createCameraDevice,
  createCameraResolution,
  type CameraDevice,
  type CameraDeviceId,
  type CameraResolution,
} from '@/domain'

import { mapDomExceptionToCameraError } from './map-dom-exception'

type VideoFrameCallbackMetadata = {
  mediaTime: number
  presentedFrames: number
}

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: VideoFrameCallbackMetadata) => void,
  ) => number
  cancelVideoFrameCallback?: (handle: number) => void
}

function createStreamHandle(): CameraStreamHandle {
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `camera-stream-${Date.now()}`,
  }
}

function isCameraSupported(): boolean {
  return Boolean(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function',
  )
}

function resolveDeviceId(
  settings: MediaTrackSettings,
  track: MediaStreamTrack | undefined,
  fallback?: string,
): CameraDeviceId | null {
  if (typeof settings.deviceId === 'string' && settings.deviceId.length > 0) {
    return settings.deviceId
  }

  const constraint = track?.getConstraints().deviceId
  if (typeof constraint === 'string') return constraint
  if (constraint && typeof constraint === 'object' && 'exact' in constraint) {
    const exact = constraint.exact
    if (typeof exact === 'string') return exact
  }

  return fallback ?? null
}

export function createWebCameraAdapter(): CameraAdapter {
  let mediaStream: MediaStream | null = null
  let streamHandle: CameraStreamHandle | null = null
  let activeDeviceId: CameraDeviceId | null = null
  let resolution: CameraResolution | null = null
  let reportedFrameRate: number | null = null
  const attachedVideos = new Set<HTMLVideoElement>()

  const stopTracks = () => {
    mediaStream?.getTracks().forEach((track) => track.stop())
    mediaStream = null
    streamHandle = null
    activeDeviceId = null
    resolution = null
    reportedFrameRate = null
  }

  const syncAttachedVideos = () => {
    for (const video of attachedVideos) {
      video.srcObject = mediaStream
    }
  }

  const readTrackMetrics = (stream: MediaStream, fallbackDeviceId?: string) => {
    const track = stream.getVideoTracks()[0]
    const settings = track?.getSettings() ?? {}

    activeDeviceId = resolveDeviceId(settings, track, fallbackDeviceId)
    resolution = createCameraResolution(
      settings.width ?? 0,
      settings.height ?? 0,
    )
    reportedFrameRate =
      typeof settings.frameRate === 'number' ? settings.frameRate : null
  }

  const buildConstraints = (
    options: OpenCameraOptions = {},
  ): MediaStreamConstraints => {
    const video: MediaTrackConstraints = {}

    if (options.deviceId) {
      video.deviceId = { exact: options.deviceId }
    } else {
      video.facingMode = 'user'
    }

    if (options.width) {
      video.width = { ideal: options.width }
    }

    if (options.height) {
      video.height = { ideal: options.height }
    }

    if (options.frameRate) {
      video.frameRate = { ideal: options.frameRate }
    }

    return {
      audio: false,
      video,
    }
  }

  const openStream = async (
    options: OpenCameraOptions = {},
  ): Promise<OpenedCamera> => {
    if (!isCameraSupported()) {
      throw new CameraError(
        'UNSUPPORTED',
        'Camera APIs are not available in this environment.',
      )
    }

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia(
        buildConstraints(options),
      )

      stopTracks()
      mediaStream = nextStream
      streamHandle = createStreamHandle()
      readTrackMetrics(nextStream, options.deviceId)
      syncAttachedVideos()

      return {
        stream: streamHandle,
        deviceId: activeDeviceId ?? options.deviceId ?? 'unknown',
        resolution: resolution ?? createCameraResolution(0, 0),
        frameRate: reportedFrameRate,
      }
    } catch (error) {
      throw mapDomExceptionToCameraError(error)
    }
  }

  return {
    isSupported: isCameraSupported,

    async getPermissionStatus() {
      if (!isCameraSupported()) return 'unsupported'

      try {
        if (!navigator.permissions?.query) return 'prompt'

        const result = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        })

        if (result.state === 'granted') return 'granted'
        if (result.state === 'denied') return 'denied'
        return 'prompt'
      } catch {
        return 'prompt'
      }
    },

    async requestPermission() {
      if (!isCameraSupported()) {
        throw new CameraError(
          'UNSUPPORTED',
          'Camera APIs are not available in this environment.',
        )
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        })
        stream.getTracks().forEach((track) => track.stop())
        return 'granted'
      } catch (error) {
        const mapped = mapDomExceptionToCameraError(error)
        if (mapped.code === 'PERMISSION_DENIED') return 'denied'
        throw mapped
      }
    },

    async listDevices() {
      if (!isCameraSupported()) {
        throw new CameraError(
          'UNSUPPORTED',
          'Camera APIs are not available in this environment.',
        )
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        return devices
          .filter((device) => device.kind === 'videoinput')
          .map((device, index) =>
            createCameraDevice({
              deviceId: device.deviceId,
              label: device.label || `Camera ${index + 1}`,
              groupId: device.groupId,
            }),
          ) satisfies readonly CameraDevice[]
      } catch (error) {
        throw mapDomExceptionToCameraError(error)
      }
    },

    open: openStream,

    async close() {
      stopTracks()
      syncAttachedVideos()
    },

    async switchDevice(deviceId, options) {
      return openStream({ ...options, deviceId })
    },

    getActiveDeviceId() {
      return activeDeviceId
    },

    getResolution() {
      return resolution
    },

    getReportedFrameRate() {
      return reportedFrameRate
    },

    getActiveStream() {
      return streamHandle
    },

    isOpen() {
      return mediaStream !== null
    },

    attachToVideo(video) {
      attachedVideos.add(video)
      video.playsInline = true
      video.muted = true
      video.autoplay = true
      video.srcObject = mediaStream

      if (mediaStream) {
        void video.play().catch(() => {
          // Autoplay can fail until a user gesture; caller may retry.
        })
      }
    },

    detachFromVideo(video) {
      attachedVideos.delete(video)
      video.srcObject = null
    },
  }
}

/**
 * Measure actual presented FPS from a playing video element.
 * Returns a stop function.
 */
export function startVideoFpsMeter(
  video: VideoWithFrameCallback,
  onFps: (fps: number) => void,
): () => void {
  let frameCount = 0
  let lastTs = performance.now()
  let rafId = 0
  let rvfcId: number | null = null
  let stopped = false

  const emit = (now: number) => {
    frameCount += 1
    const elapsed = now - lastTs
    if (elapsed >= 1000) {
      onFps(Math.round((frameCount * 1000) / elapsed))
      frameCount = 0
      lastTs = now
    }
  }

  const tickRaf = (now: number) => {
    if (stopped) return
    if (!video.paused && !video.ended && video.readyState >= 2) {
      emit(now)
    }
    rafId = requestAnimationFrame(tickRaf)
  }

  if (typeof video.requestVideoFrameCallback === 'function') {
    const tickRvfc = (now: number) => {
      if (stopped) return
      emit(now)
      rvfcId = video.requestVideoFrameCallback?.(tickRvfc) ?? null
    }
    rvfcId = video.requestVideoFrameCallback(tickRvfc)
  } else {
    rafId = requestAnimationFrame(tickRaf)
  }

  return () => {
    stopped = true
    if (
      rvfcId !== null &&
      typeof video.cancelVideoFrameCallback === 'function'
    ) {
      video.cancelVideoFrameCallback(rvfcId)
    }
    if (rafId) cancelAnimationFrame(rafId)
  }
}
