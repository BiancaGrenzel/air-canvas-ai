import { useCallback, useEffect, useSyncExternalStore } from 'react'

import type { CameraDevice } from '@/domain'

import { useCameraService } from '../useCameraService'

export type UseCameraDevicesResult = {
  devices: readonly CameraDevice[]
  activeDeviceId: string | null
  isLoading: boolean
  refresh: () => Promise<void>
}

export function useCameraDevices(options?: {
  autoRefresh?: boolean
}): UseCameraDevicesResult {
  const service = useCameraService()
  const autoRefresh = options?.autoRefresh ?? true

  const snapshot = useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getSnapshot,
  )

  const refresh = useCallback(async () => {
    await service.refreshDevices()
  }, [service])

  useEffect(() => {
    if (!autoRefresh) return
    void refresh()
  }, [autoRefresh, refresh])

  return {
    devices: snapshot.devices,
    activeDeviceId: snapshot.activeDeviceId,
    isLoading: snapshot.status === 'requesting',
    refresh,
  }
}
