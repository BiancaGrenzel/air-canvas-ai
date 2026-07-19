import { useCallback, useEffect, useSyncExternalStore } from 'react'

import type { CameraPermissionStatus } from '@/domain'

import { useCameraService } from '../useCameraService'

export type UseCameraPermissionResult = {
  permission: CameraPermissionStatus
  isSupported: boolean
  request: () => Promise<CameraPermissionStatus>
  refresh: () => Promise<CameraPermissionStatus>
}

export function useCameraPermission(): UseCameraPermissionResult {
  const service = useCameraService()

  const snapshot = useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getSnapshot,
  )

  const refresh = useCallback(async () => {
    return service.getPermissionStatus()
  }, [service])

  const request = useCallback(async () => {
    return service.requestPermission()
  }, [service])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    permission: snapshot.permission,
    isSupported: snapshot.isSupported,
    request,
    refresh,
  }
}
