export type CameraErrorCode =
  | 'UNSUPPORTED'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'NOT_READABLE'
  | 'OVERCONSTRAINED'
  | 'ABORT'
  | 'SECURITY'
  | 'UNKNOWN'

export class CameraError extends Error {
  readonly code: CameraErrorCode
  readonly cause?: unknown

  constructor(code: CameraErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'CameraError'
    this.code = code
    this.cause = cause
  }
}

export function isCameraError(error: unknown): error is CameraError {
  return error instanceof CameraError
}
