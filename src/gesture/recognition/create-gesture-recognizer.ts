import type {
  GestureDefinition,
  GestureMatch,
  HandPose,
  InteractionSnapshot,
} from '@/domain'

import {
  createGestureCommandBus,
  createLogCommandFactory,
  createNoopCommandFactory,
  type GestureCommandBus,
  type GestureCommandFactory,
} from './commands'
import { createBuiltinGestureDefinitions } from './catalog/builtin-definitions'
import {
  createDefaultMatcherRegistry,
  type GestureMatcher,
  type GestureMatcherRegistry,
  type GestureRecognitionContext,
} from './matchers'

export type GestureRecognizedListener = (match: GestureMatch) => void

export type GestureRecognizer = {
  update: (
    snapshot: InteractionSnapshot,
    hands?: readonly HandPose[],
  ) => Promise<GestureMatch | null>
  registerDefinition: (definition: GestureDefinition) => void
  unregisterDefinition: (id: string) => void
  listDefinitions: () => readonly GestureDefinition[]
  registerMatcher: (matcher: GestureMatcher) => void
  registerCommand: (factory: GestureCommandFactory) => void
  onRecognized: (listener: GestureRecognizedListener) => () => void
  reset: () => void
  getLastMatch: () => GestureMatch | null
}

export type CreateGestureRecognizerOptions = {
  definitions?: readonly GestureDefinition[]
  matchers?: GestureMatcherRegistry
  commands?: GestureCommandBus
  /** Extra command factories to register on top of builtins. */
  commandFactories?: readonly GestureCommandFactory[]
}

/**
 * High-level gesture recognition.
 * Definitions + matcher strategies + command bus — no giant switch.
 */
export function createGestureRecognizer(
  options: CreateGestureRecognizerOptions = {},
): GestureRecognizer {
  const definitions = new Map<string, GestureDefinition>()
  const seed = options.definitions ?? createBuiltinGestureDefinitions()
  for (const definition of seed) {
    definitions.set(definition.id, definition)
  }

  const matchers = options.matchers ?? createDefaultMatcherRegistry()
  const commands = options.commands ?? createGestureCommandBus()

  if (!options.commands) {
    commands.register(createNoopCommandFactory())
    commands.register(createLogCommandFactory())
  }
  for (const factory of options.commandFactories ?? []) {
    commands.register(factory)
  }

  const listeners = new Set<GestureRecognizedListener>()
  const lastFiredAt = new Map<string, number>()
  let lastMatch: GestureMatch | null = null

  const buildContext = (
    snapshot: InteractionSnapshot,
    hands: readonly HandPose[],
  ): GestureRecognitionContext => ({
    timestampMs: snapshot.timestampMs,
    snapshot,
    primary: snapshot.primary,
    features: snapshot.primary?.features ?? null,
    hands,
  })

  return {
    getLastMatch: () => lastMatch,

    listDefinitions: () => [...definitions.values()],

    registerDefinition(definition) {
      definitions.set(definition.id, definition)
    },

    unregisterDefinition(id) {
      definitions.delete(id)
      lastFiredAt.delete(id)
    },

    registerMatcher(matcher) {
      matchers.register(matcher)
    },

    registerCommand(factory) {
      commands.register(factory)
    },

    onRecognized(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    reset() {
      lastFiredAt.clear()
      lastMatch = null
    },

    async update(snapshot, hands = []) {
      const ctx = buildContext(snapshot, hands)

      let best: GestureMatch | null = null

      for (const definition of definitions.values()) {
        if (definition.enabled === false) continue

        const matcher = matchers.get(definition.matcher.type)
        if (!matcher) continue

        const score = matcher.match(ctx, definition.matcher.params)
        if (!score) continue
        if (score.confidence < definition.confidence) continue

        const lastAt = lastFiredAt.get(definition.id) ?? 0
        const cooldown = definition.cooldownMs ?? 800
        if (ctx.timestampMs - lastAt < cooldown) continue

        const candidate: GestureMatch = {
          definition,
          confidence: score.confidence,
          timestampMs: ctx.timestampMs,
          trackId: score.trackId,
        }

        if (!best || candidate.confidence > best.confidence) {
          best = candidate
        }
      }

      if (!best) return null

      lastFiredAt.set(best.definition.id, best.timestampMs)
      lastMatch = best

      for (const listener of listeners) listener(best)

      await commands.execute(best.definition.action, { match: best })

      return best
    },
  }
}
