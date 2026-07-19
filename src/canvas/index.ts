/**
 * Canvas drawing module — receives landmark data and renders.
 * No AI / MediaPipe / vision logic here.
 */

export { createHandCanvasRenderer } from './create-hand-canvas-renderer'

export { DEFAULT_HAND_CANVAS_STYLE, resolveHandCanvasStyle } from './styles'

export { HandSkeletonOverlay } from './components'
export type { HandSkeletonOverlayProps } from './components'

export type {
  CreateHandCanvasRendererOptions,
  DrawHand,
  DrawHandsFrame,
  DrawLandmark,
  HandCanvasRenderer,
  HandCanvasStyle,
} from './types'
