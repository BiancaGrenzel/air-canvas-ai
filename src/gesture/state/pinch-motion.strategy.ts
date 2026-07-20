import type { PinchMotionStrategy } from './types'

export type DragDrawingStrategyOptions = {
  /** Minimum accumulated pinch travel to leave Pinch. */
  travelThreshold?: number
  /** Prefer Drawing over Dragging when travel exceeds threshold. */
  preferDrawing?: boolean
}

export function createDragDrawingStrategy(
  options: DragDrawingStrategyOptions = {},
): PinchMotionStrategy {
  const travelThreshold = options.travelThreshold ?? 0.012
  const preferDrawing = options.preferDrawing ?? false

  return {
    id: preferDrawing ? 'prefer-drawing' : 'prefer-dragging',
    resolve(ctx) {
      if (!ctx.features.pinch.active) return 'Pinch'
      if (ctx.features.pinchTravel < travelThreshold) return 'Pinch'
      return preferDrawing ? 'Drawing' : 'Dragging'
    },
  }
}
