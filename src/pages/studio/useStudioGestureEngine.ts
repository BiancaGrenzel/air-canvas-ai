import { useEffect, useRef, useState } from 'react'

import {
  createEmptyInteractionSnapshot,
  type HandInteractionSnapshot,
  type HandTrackingFrame,
  type InteractionSnapshot,
} from '@/domain'
import { createGestureEngine, type GestureEngine } from '@/gesture'

/**
 * Presentation bridge: feeds vision frames into the React-free Gesture Engine.
 */
export function useStudioGestureEngine(
  frame: HandTrackingFrame | null,
  enabled: boolean,
) {
  const engineRef = useRef<GestureEngine | null>(null)
  const [snapshot, setSnapshot] = useState<InteractionSnapshot>(
    createEmptyInteractionSnapshot,
  )

  useEffect(() => {
    const engine = createGestureEngine({
      motion: { preferDrawing: true, travelThreshold: 0 },
      drawing: {
        releaseGraceFrames: 3,
        presenceGraceFrames: 6,
        openingFrames: 2,
      },
      pinch: {
        activateBelow: 0.12,
        releaseAbove: 0.18,
      },
    })
    engineRef.current = engine

    return () => {
      engine.reset()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) return
    engineRef.current?.reset()
  }, [enabled])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !enabled || !frame) return
    setSnapshot(engine.update(frame))
  }, [enabled, frame])

  const activeSnapshot =
    enabled && frame ? snapshot : createEmptyInteractionSnapshot()
  const primary: HandInteractionSnapshot | null = activeSnapshot.primary

  return {
    snapshot: activeSnapshot,
    primary,
    state: primary?.state ?? 'Lost',
    features: primary?.features ?? null,
  }
}
