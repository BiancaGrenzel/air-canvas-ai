/**
 * Low-level interaction states derived from landmarks.
 * Not high-level custom gestures (those come later).
 */
export type InteractionState =
  'Lost' | 'Tracking' | 'Hover' | 'Pinch' | 'Dragging' | 'Drawing' | 'Released'

export const INTERACTION_STATES: readonly InteractionState[] = [
  'Lost',
  'Tracking',
  'Hover',
  'Pinch',
  'Dragging',
  'Drawing',
  'Released',
] as const

export function isInteractionState(value: string): value is InteractionState {
  return (INTERACTION_STATES as readonly string[]).includes(value)
}
