import type { GestureMatch } from '@/domain'

/**
 * Command Pattern — each gesture action is an executable command.
 */
export interface GestureCommand {
  readonly actionId: string
  execute(context: GestureCommandContext): void | Promise<void>
}

export type GestureCommandContext = {
  readonly match: GestureMatch
  readonly payload?: Readonly<Record<string, unknown>>
}

/**
 * Factories allow registering actions by id without a giant switch.
 * Future user gestures only need to reference an existing action id
 * (or a newly registered factory).
 */
export interface GestureCommandFactory {
  readonly actionId: string
  create(params?: Readonly<Record<string, unknown>>): GestureCommand
}

export type GestureCommandBus = {
  register: (factory: GestureCommandFactory) => void
  unregister: (actionId: string) => void
  has: (actionId: string) => boolean
  listActionIds: () => readonly string[]
  execute: (
    actionId: string,
    context: GestureCommandContext,
    params?: Readonly<Record<string, unknown>>,
  ) => Promise<void>
}
