import { useState, type PropsWithChildren } from 'react'

import type { CameraAdapter } from '@/application/ports'
import { createWebCameraAdapter } from '@/infrastructure/camera'

import { CameraServiceContext } from './camera.context'
import { createCameraService, type CameraService } from './camera.service'

export type CameraProviderProps = PropsWithChildren<{
  /** Inject a custom adapter (tests / Tauri). Ignored when `service` is set. */
  adapter?: CameraAdapter
  /** Inject a fully custom service (tests). */
  service?: CameraService
}>

export function CameraProvider({
  adapter,
  service,
  children,
}: CameraProviderProps) {
  const [value] = useState(
    () => service ?? createCameraService(adapter ?? createWebCameraAdapter()),
  )

  return (
    <CameraServiceContext.Provider value={value}>
      {children}
    </CameraServiceContext.Provider>
  )
}
