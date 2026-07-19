import type {
  GestureFeatures,
  HandInteractionSnapshot,
  HandPose,
  InteractionState,
  InteractionStateChangedEvent,
} from '@/domain'
import { createIdleGestureFeatures } from '@/domain'

import { runFeatureDetectors, type GestureFeatureDetector } from '../features'
import type { InteractionStateHandler } from '../state'

type TrackInternal = {
  trackId: string
  handedness: HandPose['handedness']
  state: InteractionState
  previousState: InteractionState | null
  framesInState: number
  features: GestureFeatures
}

export function createHandTrack(
  handedness: HandPose['handedness'],
  index: number,
) {
  const track: TrackInternal = {
    trackId: `${handedness}-${index}`,
    handedness,
    state: 'Lost',
    previousState: null,
    framesInState: 0,
    features: createIdleGestureFeatures(),
  }

  return {
    get trackId() {
      return track.trackId
    },

    reset() {
      track.state = 'Lost'
      track.previousState = null
      track.framesInState = 0
      track.features = createIdleGestureFeatures()
    },

    markLost(
      timestampMs: number,
      handlers: Map<InteractionState, InteractionStateHandler>,
      emit: (event: InteractionStateChangedEvent) => void,
    ): HandInteractionSnapshot {
      track.features = createIdleGestureFeatures()
      return advance(track, handlers, timestampMs, emit)
    },

    update(
      hand: HandPose,
      timestampMs: number,
      detectors: readonly GestureFeatureDetector[],
      handlers: Map<InteractionState, InteractionStateHandler>,
      emit: (event: InteractionStateChangedEvent) => void,
    ): HandInteractionSnapshot {
      track.handedness = hand.handedness
      track.features = runFeatureDetectors(detectors, {
        hand,
        previous: track.features,
        timestampMs,
      })
      return advance(track, handlers, timestampMs, emit)
    },
  }
}

export type HandTrack = ReturnType<typeof createHandTrack>

function advance(
  track: TrackInternal,
  handlers: Map<InteractionState, InteractionStateHandler>,
  timestampMs: number,
  emit: (event: InteractionStateChangedEvent) => void,
): HandInteractionSnapshot {
  const handler = handlers.get(track.state)
  if (!handler) {
    throw new Error(`No InteractionStateHandler registered for ${track.state}`)
  }

  const ctx = {
    trackId: track.trackId,
    timestampMs,
    features: track.features,
    state: track.state,
    previousState: track.previousState,
    framesInState: track.framesInState,
    emit: (event: Omit<InteractionStateChangedEvent, 'timestampMs'>) => {
      emit({ ...event, timestampMs })
    },
  }

  let next = handler.update(ctx)
  let changed = false
  let guard = 0

  // Allow transient chains (e.g. Released → Hover) within one frame, capped.
  while (next && next !== track.state && guard < 4) {
    const currentHandler = handlers.get(track.state)
    const nextHandler = handlers.get(next)
    if (!nextHandler) {
      throw new Error(`No InteractionStateHandler registered for ${next}`)
    }

    currentHandler?.exit?.(ctx)
    track.previousState = track.state
    track.state = next
    track.framesInState = 0
    changed = true

    emit({
      trackId: track.trackId,
      from: track.previousState,
      to: track.state,
      timestampMs,
    })

    const enteredCtx = {
      ...ctx,
      state: track.state,
      previousState: track.previousState,
      framesInState: track.framesInState,
    }
    nextHandler.enter?.(enteredCtx)
    next = nextHandler.update(enteredCtx)
    guard += 1
  }

  if (!changed) {
    track.framesInState += 1
  }

  return {
    trackId: track.trackId,
    handedness: track.handedness,
    state: track.state,
    previousState: track.previousState,
    features: track.features,
    changed,
  }
}
