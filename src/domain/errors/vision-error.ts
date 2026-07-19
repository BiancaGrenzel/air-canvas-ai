export type VisionErrorCode =
  | 'UNSUPPORTED'
  | 'NOT_INITIALIZED'
  | 'ALREADY_RUNNING'
  | 'MODEL_LOAD_FAILED'
  | 'DETECTION_FAILED'
  | 'INVALID_FRAME'
  | 'UNKNOWN'

export class VisionError extends Error {
  readonly code: VisionErrorCode
  readonly cause?: unknown

  constructor(code: VisionErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'VisionError'
    this.code = code
    this.cause = cause
  }
}

export function isVisionError(error: unknown): error is VisionError {
  return error instanceof VisionError
}
