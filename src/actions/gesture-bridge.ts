import type { GestureCommandFactory } from '@/gesture'

import type { ActionCommand, ActionContext, ActionEngine } from './types'

/**
 * Expose Action Engine commands to the Gesture Recognizer bus (Command bridge).
 */
export function createGestureCommandFactoriesFromActions(
  engine: ActionEngine,
  commands: readonly ActionCommand[],
): GestureCommandFactory[] {
  return commands.map((command) => ({
    actionId: command.id,
    create(params) {
      return {
        actionId: command.id,
        async execute(gestureContext) {
          const context: ActionContext = {
            source: 'gesture',
            params: {
              ...params,
              ...gestureContext.payload,
            },
            gesture: {
              id: gestureContext.match.definition.id,
              name: gestureContext.match.definition.name,
              confidence: gestureContext.match.confidence,
            },
          }
          await engine.dispatch(command.id, context)
        },
      }
    },
  }))
}
