import { useCallback, useSyncExternalStore } from 'react'

import type { OpenCameraOptions } from '@/application/ports'
import type { CameraDeviceId } from '@/domain'

import { useCameraService } from '../useCameraService'
import type { CameraServiceSnapshot } from '../camera.service'

export type UseCameraResult = CameraServiceSnapshot & {
  open: (options?: OpenCameraOptions) => Promise<void>
  close: () => Promise<void>
  switchDevice: (
    deviceId: CameraDeviceId,
    options?: Omit<OpenCameraOptions, 'deviceId'>,
  ) => Promise<void>
  requestPermission: () => Promise<void>
  refreshDevices: () => Promise<void>
}

export function useCamera(): UseCameraResult {
  const service = useCameraService()

  const snapshot = useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getSnapshot,
  )

  const open = useCallback(
    async (options?: OpenCameraOptions) => {
      await service.open(options)
    },
    [service],
  )

  const close = useCallback(async () => {
    await service.close()
  }, [service])

  const switchDevice = useCallback(
    async (
      deviceId: CameraDeviceId,
      options?: Omit<OpenCameraOptions, 'deviceId'>,
    ) => {
      await service.switchDevice(deviceId, options)
    },
    [service],
  )

  const requestPermission = useCallback(async () => {
    await service.requestPermission()
  }, [service])

  const refreshDevices = useCallback(async () => {
    await service.refreshDevices()
  }, [service])

  return {
    ...snapshot,
    open,
    close,
    switchDevice,
    requestPermission,
    refreshDevices,
  }
}
