import type {
  CameraDevice,
  CameraDeviceId,
  CameraPermissionStatus,
  CameraResolution,
} from '@/domain'

/**
 * Opaque handle for an active camera feed.
 * Presentation binds it through the camera module — never via MediaDevices.
 */
export type CameraStreamHandle = {
  readonly id: string
}

export type OpenCameraOptions = {
  deviceId?: CameraDeviceId
  width?: number
  height?: number
  frameRate?: number
}

export type OpenedCamera = {
  readonly stream: CameraStreamHandle
  readonly deviceId: CameraDeviceId
  readonly resolution: CameraResolution
  readonly frameRate: number | null
}

/**
 * Outbound port — host-agnostic camera capability.
 * Web implements with MediaDevices; Tauri can swap the adapter later.
 */
export interface CameraPort {
  isSupported(): boolean

  getPermissionStatus(): Promise<CameraPermissionStatus>

  requestPermission(): Promise<CameraPermissionStatus>

  listDevices(): Promise<readonly CameraDevice[]>

  open(options?: OpenCameraOptions): Promise<OpenedCamera>

  close(): Promise<void>

  switchDevice(
    deviceId: CameraDeviceId,
    options?: Omit<OpenCameraOptions, 'deviceId'>,
  ): Promise<OpenedCamera>

  getActiveDeviceId(): CameraDeviceId | null

  getResolution(): CameraResolution | null

  getReportedFrameRate(): number | null

  getActiveStream(): CameraStreamHandle | null

  isOpen(): boolean
}

/**
 * Preview binding — kept separate so CameraPort stays free of DOM types.
 * Web/Tauri webview adapters implement this alongside CameraPort.
 */
export interface CameraPreviewBinder {
  attachToVideo(video: HTMLVideoElement): void
  detachFromVideo(video: HTMLVideoElement): void
}

export type CameraAdapter = CameraPort & CameraPreviewBinder
