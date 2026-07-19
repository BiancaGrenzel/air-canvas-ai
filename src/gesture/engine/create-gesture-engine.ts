import type {
  HandTrackingFrame,
  InteractionSnapshot,
  InteractionState,
  InteractionStateChangedEvent,
} from '@/domain'
import { createEmptyInteractionSnapshot } from '@/domain'

import {
  createDefaultFeatureDetectors,
  type GestureFeatureDetector,
} from '../features'
import {
  createDefaultStateHandlers,
  type CreateStateHandlersOptions,
  type InteractionStateHandler,
} from '../state'
import { createHandTrack, type HandTrack } from './hand-track'

export type GestureEngine = {
  update: (frame: HandTrackingFrame) => InteractionSnapshot
  reset: () => void
  getSnapshot: () => InteractionSnapshot
  onStateChange: (
    listener: (event: InteractionStateChangedEvent) => void,
  ) => () => void
  registerFeatureDetector: (detector: GestureFeatureDetector) => void
  registerStateHandler: (handler: InteractionStateHandler) => void
}

export type CreateGestureEngineOptions = CreateStateHandlersOptions & {
  featureDetectors?: GestureFeatureDetector[]
  stateHandlers?: Map<InteractionState, InteractionStateHandler>
  /** Max hands to track (1–2). */
  maxHands?: 1 | 2
}

/**
 * Gesture Engine — landmarks → interaction states.
 * Does not recognize high-level custom gestures; only emits state.
 */
export function createGestureEngine(
  options: CreateGestureEngineOptions = {},
): GestureEngine {
  const detectors = [
    ...(options.featureDetectors ?? createDefaultFeatureDetectors()),
  ]
  const handlers = options.stateHandlers ?? createDefaultStateHandlers(options)
  const maxHands = options.maxHands ?? 2

  const listeners = new Set<(event: InteractionStateChangedEvent) => void>()
  const tracks = new Map<string, HandTrack>()

  let snapshot = createEmptyInteractionSnapshot()

  const emit = (event: InteractionStateChangedEvent) => {
    for (const listener of listeners) listener(event)
  }

  const resolveTrack = (
    handedness: 'Left' | 'Right' | 'Unknown',
    index: number,
  ) => {
    const trackId = `${handedness}-${index}`
    let track = tracks.get(trackId)
    if (!track) {
      track = createHandTrack(handedness, index)
      tracks.set(trackId, track)
    }
    return track
  }

  return {
    getSnapshot: () => snapshot,

    onStateChange(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    registerFeatureDetector(detector) {
      const index = detectors.findIndex((item) => item.id === detector.id)
      if (index >= 0) {
        detectors[index] = detector
      } else {
        detectors.push(detector)
      }
    },

    registerStateHandler(handler) {
      handlers.set(handler.id, handler)
    },

    reset() {
      for (const track of tracks.values()) track.reset()
      tracks.clear()
      snapshot = createEmptyInteractionSnapshot()
    },

    update(frame) {
      const hands = frame.hands.slice(0, maxHands)
      const activeIds = new Set<string>()
      const handSnapshots = []

      for (let index = 0; index < hands.length; index += 1) {
        const hand = hands[index]
        if (!hand) continue

        const track = resolveTrack(hand.handedness, index)
        activeIds.add(track.trackId)
        handSnapshots.push(
          track.update(hand, frame.timestampMs, detectors, handlers, emit),
        )
      }

      for (const [trackId, track] of [...tracks.entries()]) {
        if (activeIds.has(trackId)) continue

        const lostSnapshot = track.markLost(frame.timestampMs, handlers, emit)
        handSnapshots.push(lostSnapshot)

        if (lostSnapshot.state === 'Lost') {
          tracks.delete(trackId)
        }
      }

      const primary =
        handSnapshots.find((item) => item.state !== 'Lost') ??
        handSnapshots[0] ??
        null

      snapshot = {
        timestampMs: frame.timestampMs,
        primary,
        hands: handSnapshots,
      }

      return snapshot
    },
  }
}
