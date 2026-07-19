import type { InteractionState } from '@/domain'

import type { DrawAction } from './types'

/**
 * Pure interaction rules for AirCanvas.
 * Drawing starts ink; Hover (or any non-Drawing state) stops it.
 */
export function resolveDrawAction(
  previousState: InteractionState | null,
  nextState: InteractionState,
  hasPoint: boolean,
): DrawAction {
  const wasDrawing = previousState === 'Drawing'
  const isDrawing = nextState === 'Drawing'

  if (isDrawing && hasPoint) {
    return wasDrawing ? 'continue' : 'begin'
  }

  if (wasDrawing && !isDrawing) {
    return 'end'
  }

  return 'none'
}
