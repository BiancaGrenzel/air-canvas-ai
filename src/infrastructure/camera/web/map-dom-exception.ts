import { CameraError } from '@/domain'

export function mapDomExceptionToCameraError(error: unknown): CameraError {
  if (error instanceof CameraError) {
    return error
  }

  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return new CameraError(
          'PERMISSION_DENIED',
          'Camera permission was denied.',
          error,
        )
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return new CameraError(
          'NOT_FOUND',
          'No camera device was found.',
          error,
        )
      case 'NotReadableError':
      case 'TrackStartError':
        return new CameraError(
          'NOT_READABLE',
          'The camera is already in use or could not be opened.',
          error,
        )
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        return new CameraError(
          'OVERCONSTRAINED',
          'The requested camera constraints could not be satisfied.',
          error,
        )
      case 'AbortError':
        return new CameraError(
          'ABORT',
          'The camera request was aborted.',
          error,
        )
      case 'SecurityError':
        return new CameraError(
          'SECURITY',
          'Camera access is blocked in this context.',
          error,
        )
      default:
        return new CameraError(
          'UNKNOWN',
          error.message || 'Unexpected camera error.',
          error,
        )
    }
  }

  if (error instanceof Error) {
    return new CameraError('UNKNOWN', error.message, error)
  }

  return new CameraError('UNKNOWN', 'Unexpected camera error.', error)
}
