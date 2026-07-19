/**
 * Gesture recognition use cases — register, match, dispatch.
 * Orchestration lives in `@/gesture/recognition`; this module re-exports
 * the application-facing entry points.
 */
export {
  createBuiltinGestureDefinitions,
  createGestureRecognizer,
  type CreateGestureRecognizerOptions,
  type GestureRecognizer,
} from '@/gesture/recognition'
