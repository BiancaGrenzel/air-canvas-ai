import type {
  CameraAdapter,
  OpenCameraOptions,
  OpenedCamera,
} from '@/application/ports'
import {
  CameraError,
  createCameraDevice,
  createCameraResolution,
  type CameraDevice,
  type CameraDeviceId,
  type CameraPermissionStatus,
  type CameraResolution,
} from '@/domain'

export type FakeCameraAdapterOptions = {
  devices?: readonly CameraDevice[]
  permission?: CameraPermissionStatus
  supported?: boolean
  defaultResolution?: CameraResolution
  defaultFrameRate?: number
}

function createDefaultDevices(): CameraDevice[] {
  return [
    createCameraDevice({
      deviceId: 'fake-camera-1',
      label: 'Fake Camera 1',
      groupId: 'fake-group',
    }),
    createCameraDevice({
      deviceId: 'fake-camera-2',
      label: 'Fake Camera 2',
      groupId: 'fake-group',
    }),
  ]
}

/**
 * In-memory camera adapter for unit tests — no MediaDevices dependency.
 */
export function createFakeCameraAdapter(
  options: FakeCameraAdapterOptions = {},
): CameraAdapter {
  const devices = [...(options.devices ?? createDefaultDevices())]
  let permission: CameraPermissionStatus = options.permission ?? 'prompt'
  const supported = options.supported ?? true
  let activeDeviceId: CameraDeviceId | null = null
  let resolution: CameraResolution | null = null
  let reportedFrameRate: number | null = null
  let isOpen = false
  let streamId = 0
  const attachedVideos = new Set<HTMLVideoElement>()

  const defaultResolution =
    options.defaultResolution ?? createCameraResolution(1280, 720)
  const defaultFrameRate = options.defaultFrameRate ?? 30

  const ensureSupported = () => {
    if (!supported) {
      throw new CameraError('UNSUPPORTED', 'Fake camera is unsupported.')
    }
  }

  const openInternal = async (
    openOptions: OpenCameraOptions = {},
  ): Promise<OpenedCamera> => {
    ensureSupported()

    if (permission === 'denied') {
      throw new CameraError('PERMISSION_DENIED', 'Camera permission denied.')
    }

    permission = 'granted'

    const deviceId = openOptions.deviceId ?? devices[0]?.deviceId
    if (!deviceId || !devices.some((device) => device.deviceId === deviceId)) {
      throw new CameraError('NOT_FOUND', 'Requested camera was not found.')
    }

    isOpen = true
    activeDeviceId = deviceId
    resolution = createCameraResolution(
      openOptions.width ?? defaultResolution.width,
      openOptions.height ?? defaultResolution.height,
    )
    reportedFrameRate = openOptions.frameRate ?? defaultFrameRate
    streamId += 1

    for (const video of attachedVideos) {
      video.dataset.fakeCameraAttached = 'true'
    }

    return {
      stream: { id: `fake-stream-${streamId}` },
      deviceId,
      resolution,
      frameRate: reportedFrameRate,
    }
  }

  return {
    isSupported: () => supported,

    async getPermissionStatus() {
      if (!supported) return 'unsupported'
      return permission
    },

    async requestPermission() {
      ensureSupported()
      if (permission === 'denied') return 'denied'
      permission = 'granted'
      return permission
    },

    async listDevices() {
      ensureSupported()
      return devices
    },

    open: openInternal,

    async close() {
      isOpen = false
      activeDeviceId = null
      resolution = null
      reportedFrameRate = null
      for (const video of attachedVideos) {
        video.dataset.fakeCameraAttached = 'false'
      }
    },

    async switchDevice(deviceId, switchOptions) {
      return openInternal({ ...switchOptions, deviceId })
    },

    getActiveDeviceId: () => activeDeviceId,
    getResolution: () => resolution,
    getReportedFrameRate: () => reportedFrameRate,
    getActiveStream: () => (isOpen ? { id: `fake-stream-${streamId}` } : null),
    isOpen: () => isOpen,

    attachToVideo(video) {
      attachedVideos.add(video)
      video.dataset.fakeCameraAttached = isOpen ? 'true' : 'false'
    },

    detachFromVideo(video) {
      attachedVideos.delete(video)
      delete video.dataset.fakeCameraAttached
    },
  }
}
