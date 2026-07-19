import type {
  GestureCommandBus,
  GestureCommandContext,
  GestureCommandFactory,
} from './types'

export function createGestureCommandBus(): GestureCommandBus {
  const factories = new Map<string, GestureCommandFactory>()

  return {
    register(factory) {
      factories.set(factory.actionId, factory)
    },

    unregister(actionId) {
      factories.delete(actionId)
    },

    has(actionId) {
      return factories.has(actionId)
    },

    listActionIds() {
      return [...factories.keys()]
    },

    async execute(actionId, context, params) {
      const factory = factories.get(actionId)
      if (!factory) {
        throw new Error(
          `No GestureCommandFactory registered for action "${actionId}".`,
        )
      }
      const command = factory.create(params)
      await command.execute(context)
    },
  }
}

export function createCallbackCommandFactory(
  actionId: string,
  handler: (context: GestureCommandContext) => void | Promise<void>,
): GestureCommandFactory {
  return {
    actionId,
    create() {
      return {
        actionId,
        execute: handler,
      }
    },
  }
}
