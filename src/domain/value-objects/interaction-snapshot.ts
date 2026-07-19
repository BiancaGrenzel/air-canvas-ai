import type { Handedness } from '../enums/handedness'
import type { InteractionState } from '../enums/interaction-state'
import type { GestureFeatures } from './gesture-features'

export type HandInteractionSnapshot = {
  readonly trackId: string
  readonly handedness: Handedness
  readonly state: InteractionState
  readonly previousState: InteractionState | null
  readonly features: GestureFeatures
  readonly changed: boolean
}

export type InteractionSnapshot = {
  readonly timestampMs: number
  readonly primary: HandInteractionSnapshot | null
  readonly hands: readonly HandInteractionSnapshot[]
}

export function createEmptyInteractionSnapshot(
  timestampMs = 0,
): InteractionSnapshot {
  return {
    timestampMs,
    primary: null,
    hands: [],
  }
}
