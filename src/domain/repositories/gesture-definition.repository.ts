import type { GestureDefinition } from '../value-objects/gesture-definition'

/**
 * Port for persisting / loading gesture definitions (JSON, remote, etc.).
 */
export interface GestureDefinitionRepository {
  list(): Promise<readonly GestureDefinition[]>
  getById(id: string): Promise<GestureDefinition | null>
  save(definition: GestureDefinition): Promise<void>
  remove(id: string): Promise<void>
}
