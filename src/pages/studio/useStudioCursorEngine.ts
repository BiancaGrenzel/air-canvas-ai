import { useEffect, useRef, useState } from 'react'

import {
  createCursorEngine,
  type CursorEngine,
  type CursorEngineConfig,
  type CursorPoint,
} from '@/cursor'
import type { PointerPoint } from '@/domain'
import { useSettingsStore } from '@/store'

const BASE_STUDIO_CURSOR_CONFIG: Partial<CursorEngineConfig> = {
  acceleration: 0.2,
  bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  // More responsive while drawing — less lag / overshoot on strokes.
  oneEuro: { minCutoff: 1.6, beta: 0.025, dCutoff: 1.0 },
}

/**
 * Presentation bridge: pointer feature → React-free Cursor Engine.
 * Sensitivity and mirroring come from the persisted settings store.
 */
export function useStudioCursorEngine(
  pointer: PointerPoint | null,
  timestampMs: number,
  enabled: boolean,
) {
  const sensitivity = useSettingsStore((s) => s.sensitivity)
  const mirrored = useSettingsStore((s) => s.mirrored)

  const engineRef = useRef<CursorEngine | null>(null)
  const [position, setPosition] = useState<CursorPoint | null>(null)

  useEffect(() => {
    const { sensitivity: initialSensitivity, mirrored: initialMirrored } =
      useSettingsStore.getState()
    const engine = createCursorEngine({
      ...BASE_STUDIO_CURSOR_CONFIG,
      sensitivity: initialSensitivity,
      mirrored: initialMirrored,
    })
    engineRef.current = engine
    return () => {
      engine.reset()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    engineRef.current?.setConfig({ sensitivity, mirrored })
  }, [sensitivity, mirrored])

  useEffect(() => {
    if (enabled) return
    engineRef.current?.reset()
  }, [enabled])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !enabled || !pointer) return
    setPosition(
      engine.update({
        x: pointer.x,
        y: pointer.y,
        timestampMs,
      }),
    )
  }, [enabled, pointer, timestampMs])

  return {
    position: enabled ? position : null,
  }
}
