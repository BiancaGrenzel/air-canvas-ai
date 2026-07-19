import { useContext } from 'react'

import { CameraServiceContext } from './camera.context'
import type { CameraService } from './camera.service'

export function useCameraService(): CameraService {
  const ctx = useContext(CameraServiceContext)

  if (!ctx) {
    throw new Error(
      'useCameraService must be used within a CameraProvider. Wire it in AppProviders.',
    )
  }

  return ctx
}
