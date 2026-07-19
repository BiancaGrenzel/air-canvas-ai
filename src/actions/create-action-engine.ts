import type {
  ActionCommand,
  ActionDefinition,
  ActionEngine,
  CreateActionEngineOptions,
} from './types'

/**
 * Action Engine — dispatches named actions via Command Pattern.
 * Domains register independently (canvas today; Spotify/OS later).
 */
export function createActionEngine(
  options: CreateActionEngineOptions = {},
): ActionEngine {
  const commands = new Map<string, ActionCommand>()

  for (const command of options.commands ?? []) {
    commands.set(command.id, command)
  }

  return {
    register(command) {
      commands.set(command.id, command)
    },

    unregister(id) {
      commands.delete(id)
    },

    has(id) {
      return commands.has(id)
    },

    list() {
      return [...commands.values()].map((command) => command.definition)
    },

    async dispatch(id, context = {}) {
      const command = commands.get(id)
      if (!command) {
        throw new Error(`No ActionCommand registered for "${id}".`)
      }
      if (!command.definition.enabled) {
        return
      }
      await command.execute(context)
    },
  }
}

export function createActionDefinition(
  input: ActionDefinition,
): ActionDefinition {
  return {
    ...input,
    enabled: input.enabled ?? true,
  }
}
