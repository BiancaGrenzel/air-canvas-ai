export type CameraDeviceId = string

export type CameraDevice = {
  readonly deviceId: CameraDeviceId
  readonly label: string
  readonly groupId: string
}

export function createCameraDevice(input: {
  deviceId: string
  label: string
  groupId?: string
}): CameraDevice {
  return {
    deviceId: input.deviceId,
    label: input.label.trim() || `Camera ${input.deviceId.slice(0, 4)}`,
    groupId: input.groupId ?? '',
  }
}
