import type {
  CameraAdapter,
  OpenCameraOptions,
  OpenedCamera,
} from '@/application/ports'
import {
  isCameraError,
  type CameraDevice,
  type CameraDeviceId,
  type CameraPermissionStatus,
  type CameraResolution,
  type CameraSessionStatus,
} from '@/domain'
import { startVideoFpsMeter } from '@/infrastructure/camera'

export type CameraServiceSnapshot = {
  status: CameraSessionStatus
  permission: CameraPermissionStatus
  devices: readonly CameraDevice[]
  activeDeviceId: CameraDeviceId | null
  resolution: CameraResolution | null
  reportedFps: number | null
  actualFps: number | null
  errorMessage: string | null
  isSupported: boolean
  isOpen: boolean
}

type Listener = (snapshot: CameraServiceSnapshot) => void

export type CameraService = {
  getSnapshot: () => CameraServiceSnapshot
  subscribe: (listener: Listener) => () => void
  getPermissionStatus: () => Promise<CameraPermissionStatus>
  requestPermission: () => Promise<CameraPermissionStatus>
  refreshDevices: () => Promise<readonly CameraDevice[]>
  open: (options?: OpenCameraOptions) => Promise<OpenedCamera>
  close: () => Promise<void>
  switchDevice: (
    deviceId: CameraDeviceId,
    options?: Omit<OpenCameraOptions, 'deviceId'>,
  ) => Promise<OpenedCamera>
  attachToVideo: (video: HTMLVideoElement) => void
  detachFromVideo: (video: HTMLVideoElement) => void
  /** Exposed for advanced tests; prefer service methods in app code. */
  getAdapter: () => CameraAdapter
}

export function createCameraService(adapter: CameraAdapter): CameraService {
  const listeners = new Set<Listener>()
  let fpsStop: (() => void) | null = null

  let snapshot: CameraServiceSnapshot = {
    status: 'idle',
    permission: 'prompt',
    devices: [],
    activeDeviceId: null,
    resolution: null,
    reportedFps: null,
    actualFps: null,
    errorMessage: null,
    isSupported: adapter.isSupported(),
    isOpen: false,
  }

  const emit = () => {
    for (const listener of listeners) listener(snapshot)
  }

  const patch = (partial: Partial<CameraServiceSnapshot>) => {
    snapshot = { ...snapshot, ...partial }
    emit()
  }

  const syncFromAdapter = (extra?: Partial<CameraServiceSnapshot>) => {
    patch({
      activeDeviceId: adapter.getActiveDeviceId(),
      resolution: adapter.getResolution(),
      reportedFps: adapter.getReportedFrameRate(),
      isOpen: adapter.isOpen(),
      isSupported: adapter.isSupported(),
      ...extra,
    })
  }

  const toErrorMessage = (error: unknown) => {
    if (isCameraError(error)) return error.message
    if (error instanceof Error) return error.message
    return 'Unexpected camera error.'
  }

  const stopFpsMeter = () => {
    fpsStop?.()
    fpsStop = null
  }

  const service: CameraService = {
    getSnapshot: () => snapshot,

    subscribe(listener) {
      listeners.add(listener)
      listener(snapshot)
      return () => {
        listeners.delete(listener)
      }
    },

    getAdapter: () => adapter,

    async getPermissionStatus() {
      const permission = await adapter.getPermissionStatus()
      patch({
        permission,
        isSupported: adapter.isSupported(),
      })
      return permission
    },

    async requestPermission() {
      patch({ status: 'requesting', errorMessage: null })
      try {
        const permission = await adapter.requestPermission()
        const devices = await adapter.listDevices()
        patch({
          status: adapter.isOpen() ? 'open' : 'idle',
          permission,
          devices,
          errorMessage: null,
        })
        return permission
      } catch (error) {
        patch({
          status: 'error',
          permission: 'denied',
          errorMessage: toErrorMessage(error),
        })
        throw error
      }
    },

    async refreshDevices() {
      try {
        const permission = await adapter.getPermissionStatus()
        const devices = await adapter.listDevices()
        patch({ permission, devices, errorMessage: null })
        return devices
      } catch (error) {
        patch({ errorMessage: toErrorMessage(error) })
        throw error
      }
    },

    async open(options) {
      patch({ status: 'starting', errorMessage: null })
      try {
        const opened = await adapter.open(options)
        const permission = await adapter.getPermissionStatus()
        const devices = await adapter.listDevices()
        syncFromAdapter({
          status: 'open',
          permission,
          devices,
          actualFps: null,
          errorMessage: null,
        })
        return opened
      } catch (error) {
        syncFromAdapter({
          status: 'error',
          errorMessage: toErrorMessage(error),
        })
        throw error
      }
    },

    async close() {
      patch({ status: 'stopping', errorMessage: null })
      stopFpsMeter()
      try {
        await adapter.close()
        syncFromAdapter({
          status: 'idle',
          actualFps: null,
          errorMessage: null,
        })
      } catch (error) {
        syncFromAdapter({
          status: 'error',
          errorMessage: toErrorMessage(error),
        })
        throw error
      }
    },

    async switchDevice(deviceId, options) {
      patch({ status: 'starting', errorMessage: null })
      try {
        const opened = await adapter.switchDevice(deviceId, options)
        const devices = await adapter.listDevices()
        syncFromAdapter({
          status: 'open',
          devices,
          actualFps: null,
          errorMessage: null,
        })
        return opened
      } catch (error) {
        syncFromAdapter({
          status: 'error',
          errorMessage: toErrorMessage(error),
        })
        throw error
      }
    },

    attachToVideo(video) {
      adapter.attachToVideo(video)
      stopFpsMeter()
      fpsStop = startVideoFpsMeter(video, (fps) => {
        if (snapshot.actualFps === fps) return
        patch({ actualFps: fps })
      })
    },

    detachFromVideo(video) {
      stopFpsMeter()
      adapter.detachFromVideo(video)
      if (snapshot.actualFps !== null) {
        patch({ actualFps: null })
      }
    },
  }

  return service
}
