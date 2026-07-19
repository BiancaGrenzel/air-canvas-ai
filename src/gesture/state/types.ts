import type {
  GestureFeatures,
  InteractionState,
  InteractionStateChangedEvent,
} from '@/domain'

export type InteractionTrackContext = {
  readonly trackId: string
  readonly timestampMs: number
  readonly features: GestureFeatures
  readonly state: InteractionState
  readonly previousState: InteractionState | null
  readonly framesInState: number
  emit: (event: Omit<InteractionStateChangedEvent, 'timestampMs'>) => void
}

/**
 * State Pattern: each interaction state owns its transition rules.
 * Avoids a monolithic switch/if chain in the engine.
 */
export interface InteractionStateHandler {
  readonly id: InteractionState
  enter?(ctx: InteractionTrackContext): void
  exit?(ctx: InteractionTrackContext): void
  /**
   * Returns the next state id, or `null` to remain in the current state.
   */
  update(ctx: InteractionTrackContext): InteractionState | null
}

/**
 * Strategy: decide whether pinch + motion becomes Dragging or Drawing.
 * Default is Dragging; swap strategy later without touching states.
 */
export interface PinchMotionStrategy {
  readonly id: string
  resolve(ctx: InteractionTrackContext): 'Dragging' | 'Drawing' | 'Pinch'
}
