import type { InteractionState } from '../enums/interaction-state'

export type InteractionStateChangedEvent = {
  readonly trackId: string
  readonly from: InteractionState | null
  readonly to: InteractionState
  readonly timestampMs: number
}
