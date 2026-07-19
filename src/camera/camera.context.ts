import { createContext } from 'react'

import type { CameraService } from './camera.service'

export const CameraServiceContext = createContext<CameraService | null>(null)
