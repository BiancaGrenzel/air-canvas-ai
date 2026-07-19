export type CameraResolution = {
  readonly width: number
  readonly height: number
}

export function createCameraResolution(
  width: number,
  height: number,
): CameraResolution {
  return {
    width: Math.max(0, Math.round(width)),
    height: Math.max(0, Math.round(height)),
  }
}

export function formatCameraResolution(
  resolution: CameraResolution | null,
): string {
  if (!resolution || resolution.width === 0 || resolution.height === 0) {
    return '—'
  }

  return `${resolution.width}×${resolution.height}`
}
