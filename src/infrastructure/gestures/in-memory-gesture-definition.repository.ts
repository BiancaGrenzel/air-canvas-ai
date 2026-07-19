import type { GestureDefinition, GestureDefinitionRepository } from '@/domain'

/**
 * In-memory repository — swap for JSON/file/remote later without changing recognizer.
 */
export function createInMemoryGestureDefinitionRepository(
  seed: readonly GestureDefinition[] = [],
): GestureDefinitionRepository {
  const store = new Map<string, GestureDefinition>()

  for (const definition of seed) {
    store.set(definition.id, definition)
  }

  return {
    async list() {
      return [...store.values()]
    },

    async getById(id) {
      return store.get(id) ?? null
    },

    async save(definition) {
      store.set(definition.id, definition)
    },

    async remove(id) {
      store.delete(id)
    },
  }
}
