export { CameraProvider } from './camera.provider'
export type { CameraProviderProps } from './camera.provider'

export { useCameraService } from './useCameraService'

export {
  createCameraService,
  type CameraService,
  type CameraServiceSnapshot,
} from './camera.service'

export {
  useCamera,
  useCameraDevices,
  useCameraPermission,
  useCameraVideoRef,
} from './hooks'

export type {
  UseCameraDevicesResult,
  UseCameraPermissionResult,
  UseCameraResult,
} from './hooks'

export { CameraPreview } from './components'
export type { CameraPreviewProps } from './components'
