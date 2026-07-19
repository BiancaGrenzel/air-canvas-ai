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

export type GestureLogEntry =
  | {
      readonly kind: 'recognized'
      readonly gestureId: string
      readonly action: string
    }
  | {
      readonly kind: 'logged'
      readonly gestureId: string
      readonly confidence: number
    }

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
  const [log, setLog] = useState<GestureLogEntry[]>([])
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
          setLog((prev) =>
            [
              {
                kind: 'logged' as const,
                gestureId: ctx.match.definition.id,
                confidence: ctx.match.confidence,
              },
              ...prev,
            ].slice(0, 8),
          )
        }),
        ...createGestureCommandFactoriesFromActions(
          actionEngine,
          canvasCommands,
        ),
      ],
    })

    const unsubscribe = recognizer.onRecognized((match) => {
      setLastMatch(match)
      setLog((prev) =>
        [
          {
            kind: 'recognized' as const,
            gestureId: match.definition.id,
            action: match.definition.action,
          },
          ...prev,
        ].slice(0, 8),
      )
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
