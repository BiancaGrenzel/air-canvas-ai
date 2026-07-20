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
  const holdStartedAt = new Map<string, number>()
  const exclusiveGroupLastFiredAt = new Map<string, number>()
  let lastMatch: GestureMatch | null = null
  /**
   * Suppress pose commands after inking so release frames ≠ clear/save/color.
   * Clear (rock) needs a longer window: opening a pinch after an upward stroke
   * often looks like 🤘 for a beat.
   */
  let inkGuardUntilMs = 0
  let clearGuardUntilMs = 0

  const isInkingState = (
    state: string | null | undefined,
  ): state is 'Pinch' | 'Drawing' | 'Dragging' =>
    state === 'Pinch' || state === 'Drawing' || state === 'Dragging'

  const justLeftInk = (
    state: string | null | undefined,
    previous: string | null | undefined,
  ) =>
    (state === 'Released' || state === 'Hover') &&
    (previous === 'Drawing' ||
      previous === 'Pinch' ||
      previous === 'Dragging' ||
      previous === 'Released')

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
      holdStartedAt.delete(id)
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
      holdStartedAt.clear()
      exclusiveGroupLastFiredAt.clear()
      lastMatch = null
      inkGuardUntilMs = 0
      clearGuardUntilMs = 0
    },

    async update(snapshot, hands = []) {
      const ctx = buildContext(snapshot, hands)
      const primary = ctx.primary

      if (
        isInkingState(primary?.state) ||
        isInkingState(primary?.previousState) ||
        primary?.features.pinch.active
      ) {
        // ~450ms after leaving draw/pinch before color may fire.
        inkGuardUntilMs = Math.max(inkGuardUntilMs, ctx.timestampMs + 450)
      }

      if (
        primary?.state === 'Drawing' ||
        primary?.previousState === 'Drawing' ||
        justLeftInk(primary?.state, primary?.previousState)
      ) {
        // ~1.1s before rock/clear — release-after-upstroke often mimics 🤘.
        clearGuardUntilMs = Math.max(clearGuardUntilMs, ctx.timestampMs + 1100)
      }

      const inkGuarded = ctx.timestampMs < inkGuardUntilMs
      const clearGuarded = ctx.timestampMs < clearGuardUntilMs

      let best: GestureMatch | null = null

      for (const definition of definitions.values()) {
        if (definition.enabled === false) continue

        const isPose = definition.exclusiveGroup === 'hand-pose'
        const isClear = definition.id === 'rock'
        const isColorTap = definition.id === 'pinch-tap'
        const blocksWhileInking = isPose || isColorTap

        if (
          blocksWhileInking &&
          (inkGuarded ||
            (isClear && clearGuarded) ||
            isInkingState(primary?.state) ||
            primary?.features.pinch.active)
        ) {
          holdStartedAt.delete(definition.id)
          continue
        }

        const matcher = matchers.get(definition.matcher.type)
        if (!matcher) continue

        const score = matcher.match(ctx, definition.matcher.params)
        const passes =
          Boolean(score) &&
          score !== null &&
          score.confidence >= definition.confidence

        if (!passes || !score) {
          holdStartedAt.delete(definition.id)
          continue
        }

        const holdMs = definition.holdMs ?? 0
        const holdStart = holdStartedAt.get(definition.id)
        if (holdStart === undefined) {
          holdStartedAt.set(definition.id, ctx.timestampMs)
          if (holdMs > 0) continue
        } else if (ctx.timestampMs - holdStart < holdMs) {
          continue
        }

        const lastAt = lastFiredAt.get(definition.id)
        if (lastAt !== undefined) {
          const cooldown = definition.cooldownMs ?? 800
          if (ctx.timestampMs - lastAt < cooldown) continue
        }

        const group = definition.exclusiveGroup
        if (group) {
          const groupLast = exclusiveGroupLastFiredAt.get(group)
          if (groupLast !== undefined) {
            // Short shared window so fist → rock still feels usable.
            const groupCooldown = Math.min(
              Math.max(definition.cooldownMs ?? 800, 600),
              1000,
            )
            if (ctx.timestampMs - groupLast < groupCooldown) continue
          }
        }

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
      holdStartedAt.delete(best.definition.id)
      if (best.definition.exclusiveGroup) {
        exclusiveGroupLastFiredAt.set(
          best.definition.exclusiveGroup,
          best.timestampMs,
        )
      }
      lastMatch = best

      for (const listener of listeners) listener(best)

      await commands.execute(best.definition.action, { match: best })

      return best
    },
  }
}
