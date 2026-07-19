export type ActionDomain =
  'canvas' | 'media' | 'presentation' | 'editor' | 'os' | 'system'

/**
 * Metadata for an executable action (catalog / UI / future plugins).
 */
export type ActionDefinition = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly domain: ActionDomain
  readonly enabled: boolean
}

export type ActionContext = {
  readonly source?: 'gesture' | 'ui' | 'api' | 'system'
  readonly params?: Readonly<Record<string, unknown>>
  readonly gesture?: {
    readonly id: string
    readonly name: string
    readonly confidence: number
  }
}

/**
 * Command Pattern — one action, one command.
 */
export interface ActionCommand {
  readonly id: string
  readonly definition: ActionDefinition
  execute: (context?: ActionContext) => void | Promise<void>
}

export type ActionEngine = {
  register: (command: ActionCommand) => void
  unregister: (id: string) => void
  has: (id: string) => boolean
  list: () => readonly ActionDefinition[]
  dispatch: (id: string, context?: ActionContext) => Promise<void>
}

export type CreateActionEngineOptions = {
  commands?: readonly ActionCommand[]
}
