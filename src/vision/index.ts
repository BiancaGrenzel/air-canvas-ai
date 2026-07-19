/**
 * Vision module — Hand Landmarker orchestration.
 *
 * Public API of a vision controller:
 * - start()
 * - stop()
 * - onResults(listener)
 *
 * No React. No rendering. AI stays framework-agnostic.
 */

export { createHandVision } from './create-hand-vision'

export type {
  CreateHandVisionOptions,
  HandVision,
  HandVisionErrorListener,
  HandVisionResults,
  HandVisionResultsListener,
  VisionFrameProvider,
} from './types'
