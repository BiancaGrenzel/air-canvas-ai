import type { InteractionState } from '@/domain'

import { createDraggingState } from './dragging.state'
import { createDrawingState } from './drawing.state'
import { createHoverState } from './hover.state'
import { createLostState } from './lost.state'
import {
  createDragDrawingStrategy,
  type DragDrawingStrategyOptions,
} from './pinch-motion.strategy'
import { createPinchState } from './pinch.state'
import { createReleasedState } from './released.state'
import { createTrackingState } from './tracking.state'
import type { InteractionStateHandler, PinchMotionStrategy } from './types'

export type {
  InteractionStateHandler,
  InteractionTrackContext,
  PinchMotionStrategy,
} from './types'

export { createLostState } from './lost.state'
export { createTrackingState } from './tracking.state'
export { createHoverState } from './hover.state'
export { createPinchState } from './pinch.state'
export { createDraggingState } from './dragging.state'
export { createDrawingState } from './drawing.state'
export { createReleasedState } from './released.state'
export { createDragDrawingStrategy } from './pinch-motion.strategy'
export type { DragDrawingStrategyOptions } from './pinch-motion.strategy'

export type CreateStateHandlersOptions = {
  motionStrategy?: PinchMotionStrategy
  motion?: DragDrawingStrategyOptions
  trackingSettleFrames?: number
}

export function createDefaultStateHandlers(
  options: CreateStateHandlersOptions = {},
): Map<InteractionState, InteractionStateHandler> {
  const motionStrategy =
    options.motionStrategy ?? createDragDrawingStrategy(options.motion)

  const handlers: InteractionStateHandler[] = [
    createLostState(),
    createTrackingState({ settleFrames: options.trackingSettleFrames }),
    createHoverState(),
    createPinchState(motionStrategy),
    createDraggingState(),
    createDrawingState(),
    createReleasedState(),
  ]

  return new Map(handlers.map((handler) => [handler.id, handler]))
}
