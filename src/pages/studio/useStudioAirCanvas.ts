import { useEffect, useMemo, useState } from 'react'

import type { CanvasActionPort } from '@/application/ports'
import {
  createAirCanvas,
  type AirCanvasEngine,
  type AirCanvasTool,
} from '@/air-canvas'
import type { CursorPoint } from '@/cursor'
import type { InteractionState } from '@/domain'
import { useSettingsStore } from '@/store'

/**
 * Presentation bridge: Gesture state + cursor → React-free AirCanvas engine.
 * Brush color / thickness stay synced with the persisted settings store.
 */
export function useStudioAirCanvas(
  state: InteractionState,
  cursor: CursorPoint | null,
  enabled: boolean,
) {
  const color = useSettingsStore((s) => s.color)
  const thickness = useSettingsStore((s) => s.thickness)
  const setStoreColor = useSettingsStore((s) => s.setColor)
  const setStoreThickness = useSettingsStore((s) => s.setThickness)

  const [engine] = useState<AirCanvasEngine>(() =>
    createAirCanvas({
      color: useSettingsStore.getState().color,
      thickness: useSettingsStore.getState().thickness,
    }),
  )
  const [tool, setToolState] = useState<AirCanvasTool>('brush')

  useEffect(() => {
    return () => {
      engine.detach()
    }
  }, [engine])

  useEffect(() => {
    engine.setColor(color)
  }, [engine, color])

  useEffect(() => {
    engine.setThickness(thickness)
  }, [engine, thickness])

  useEffect(() => {
    if (!enabled) {
      if (engine.isStrokeActive()) {
        engine.endStroke()
      }
      return
    }

    engine.handleInteraction({
      state,
      point: cursor,
    })
  }, [engine, enabled, state, cursor])

  const setTool = (next: AirCanvasTool) => {
    engine.setTool(next)
    setToolState(next)
  }

  const setColor = (next: string) => {
    engine.setColor(next)
    setStoreColor(next)
  }

  const setThickness = (next: number) => {
    engine.setThickness(next)
    setStoreThickness(next)
  }

  const clear = () => {
    engine.clear()
  }

  const savePng = () => {
    engine.downloadPng(
      `aircanvas-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`,
    )
  }

  const canvasActionPort = useMemo<CanvasActionPort>(
    () => ({
      setColor(next) {
        engine.setColor(next)
        useSettingsStore.getState().setColor(next)
      },
      getColor() {
        return engine.getSettings().color
      },
      clear() {
        engine.clear()
      },
      saveImage(filename) {
        engine.downloadPng(filename)
      },
    }),
    [engine],
  )

  return {
    engine,
    tool,
    color,
    thickness,
    strokeActive: enabled && state === 'Drawing',
    setTool,
    setColor,
    setThickness,
    clear,
    savePng,
    canvasActionPort,
  }
}
