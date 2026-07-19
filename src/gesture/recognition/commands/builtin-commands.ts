import type { GestureCommandFactory } from './types'

export function createNoopCommandFactory(): GestureCommandFactory {
  return {
    actionId: 'noop',
    create() {
      return {
        actionId: 'noop',
        execute() {
          // Intentionally empty — useful as a safe default action.
        },
      }
    },
  }
}

export function createLogCommandFactory(
  onLog?: (message: string) => void,
): GestureCommandFactory {
  return {
    actionId: 'log',
    create(params) {
      const prefix =
        typeof params?.prefix === 'string' ? params.prefix : '[gesture]'
      return {
        actionId: 'log',
        execute(context) {
          const message = `${prefix} ${context.match.definition.name} (${(context.match.confidence * 100).toFixed(0)}%)`
          if (onLog) {
            onLog(message)
            return
          }
          console.info(message)
        },
      }
    },
  }
}
