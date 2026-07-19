import { useEffect, useMemo, useRef, useState } from 'react'

import { AIR_CANVAS_COLOR_PRESETS } from '@/air-canvas'
import {
  createActionEngine,
  createCanvasActions,
  createFutureActionPlaceholders,
  createGestureCommandFactoriesFromActions,
  type ActionDefinition,
  type ActionEngine,
} from '@/actions'
import type { CanvasActionPort } from '@/application/ports'
import type {
  GestureMatch,
  HandPose,
  HandTrackingFrame,
  InteractionSnapshot,
} from '@/domain'
import {
  createBuiltinGestureDefinitions,
  createCallbackCommandFactory,
  createGestureRecognizer,
  type GestureRecognizer,
} from '@/gesture'

/**
 * Presentation bridge: Action Engine + Gesture Recognizer wired together.
 */
export function useStudioGestureRecognition(
  snapshot: InteractionSnapshot,
  visionFrame: HandTrackingFrame | null,
  enabled: boolean,
  canvasActionPort: CanvasActionPort,
) {
  const recognizerRef = useRef<GestureRecognizer | null>(null)
  const [lastMatch, setLastMatch] = useState<GestureMatch | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [definitions] = useState(() => createBuiltinGestureDefinitions())

  const { actionEngine, actionCatalog, canvasCommands } = useMemo(() => {
    const canvasCommands = createCanvasActions(canvasActionPort, {
      palette: AIR_CANVAS_COLOR_PRESETS,
    })
    const placeholders = createFutureActionPlaceholders()
    const engine = createActionEngine({
      commands: [...canvasCommands, ...placeholders],
    })

    return {
      actionEngine: engine,
      actionCatalog: engine.list(),
      canvasCommands,
    }
  }, [canvasActionPort])

  useEffect(() => {
    const recognizer = createGestureRecognizer({
      definitions,
      commandFactories: [
        createCallbackCommandFactory('log', (ctx) => {
          const line = `${ctx.match.definition.name} · ${(ctx.match.confidence * 100).toFixed(0)}%`
          setLog((prev) => [line, ...prev].slice(0, 8))
        }),
        ...createGestureCommandFactoriesFromActions(
          actionEngine,
          canvasCommands,
        ),
      ],
    })

    const unsubscribe = recognizer.onRecognized((match) => {
      setLastMatch(match)
      const line = `${match.definition.name} → ${match.definition.action}`
      setLog((prev) => [line, ...prev].slice(0, 8))
    })

    recognizerRef.current = recognizer

    return () => {
      unsubscribe()
      recognizer.reset()
      recognizerRef.current = null
    }
  }, [definitions, actionEngine, canvasCommands])

  useEffect(() => {
    if (!enabled) {
      recognizerRef.current?.reset()
      return
    }

    const hands: readonly HandPose[] = visionFrame?.hands ?? []
    void recognizerRef.current?.update(snapshot, hands)
  }, [enabled, snapshot, visionFrame])

  return {
    lastMatch,
    log,
    definitions,
    actionEngine,
    actionCatalog,
    dispatchAction: (id: string) => actionEngine.dispatch(id, { source: 'ui' }),
  }
}

export type { ActionDefinition, ActionEngine }
