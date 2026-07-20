import { describe, expect, it, vi } from 'vitest'

import {
  createEmptyInteractionSnapshot,
  createGestureDefinition,
  createIdleGestureFeatures,
  type HandInteractionSnapshot,
  type InteractionSnapshot,
} from '@/domain'

import { createGestureRecognizer } from './create-gesture-recognizer'
import { createCallbackCommandFactory } from './commands'

function snapshotWith(
  partial: Partial<HandInteractionSnapshot>,
): InteractionSnapshot {
  const primary: HandInteractionSnapshot = {
    trackId: 'Right-0',
    handedness: 'Right',
    state: 'Hover',
    previousState: 'Tracking',
    features: createIdleGestureFeatures(),
    changed: true,
    ...partial,
  }

  return {
    timestampMs: 1000,
    primary,
    hands: [primary],
  }
}

describe('createGestureRecognizer', () => {
  it('executes the command of the best matching gesture', async () => {
    const executed: string[] = []

    const recognizer = createGestureRecognizer({
      definitions: [
        createGestureDefinition({
          id: 'enter-hover',
          name: 'Enter Hover',
          description: 'test',
          confidence: 0.4,
          action: 'record',
          matcher: {
            type: 'interaction-enter',
            params: { state: 'Hover' },
          },
          cooldownMs: 0,
        }),
      ],
      commandFactories: [
        createCallbackCommandFactory('record', (ctx) => {
          executed.push(ctx.match.definition.id)
        }),
      ],
    })

    const match = await recognizer.update(
      snapshotWith({
        state: 'Hover',
        previousState: 'Tracking',
        changed: true,
        features: {
          ...createIdleGestureFeatures(),
          present: true,
          confidence: 0.9,
        },
      }),
    )

    expect(match?.definition.id).toBe('enter-hover')
    expect(executed).toEqual(['enter-hover'])
  })

  it('respects cooldown between repeated matches', async () => {
    const executed: string[] = []

    const recognizer = createGestureRecognizer({
      definitions: [
        createGestureDefinition({
          id: 'hold-hover',
          name: 'Hold Hover',
          description: 'test',
          confidence: 0.4,
          action: 'record',
          matcher: {
            type: 'interaction-hold',
            params: { state: 'Hover' },
          },
          cooldownMs: 500,
        }),
      ],
      commandFactories: [
        createCallbackCommandFactory('record', (ctx) => {
          executed.push(ctx.match.definition.id)
        }),
      ],
    })

    const frame = snapshotWith({
      state: 'Hover',
      previousState: 'Hover',
      features: {
        ...createIdleGestureFeatures(),
        present: true,
        confidence: 0.9,
      },
    })

    await recognizer.update(frame)
    await recognizer.update({ ...frame, timestampMs: 1200 })
    await recognizer.update({ ...frame, timestampMs: 1600 })

    expect(executed).toHaveLength(2)
  })

  it('allows registering a new definition at runtime without code changes', async () => {
    const handler = vi.fn()

    const recognizer = createGestureRecognizer({
      definitions: [],
      commandFactories: [createCallbackCommandFactory('custom', handler)],
    })

    recognizer.registerDefinition(
      createGestureDefinition({
        id: 'custom-released',
        name: 'Custom Released',
        description: 'User-defined style definition',
        confidence: 0.5,
        action: 'custom',
        matcher: {
          type: 'interaction-enter',
          params: { state: 'Released' },
        },
        cooldownMs: 0,
      }),
    )

    await recognizer.update(
      snapshotWith({
        state: 'Released',
        previousState: 'Pinch',
        features: {
          ...createIdleGestureFeatures(),
          present: true,
          confidence: 0.8,
        },
      }),
    )

    expect(handler).toHaveBeenCalledOnce()
  })

  it('returns null when nothing matches', async () => {
    const recognizer = createGestureRecognizer({
      definitions: [
        createGestureDefinition({
          id: 'enter-drawing',
          name: 'Start Drawing',
          description: 'test',
          confidence: 0.5,
          action: 'noop',
          matcher: {
            type: 'interaction-enter',
            params: { state: 'Drawing' },
          },
        }),
      ],
    })

    const match = await recognizer.update(createEmptyInteractionSnapshot(10))
    expect(match).toBeNull()
  })

  it('requires holdMs before firing a continuous match', async () => {
    const executed: string[] = []

    const recognizer = createGestureRecognizer({
      definitions: [
        createGestureDefinition({
          id: 'hold-hover',
          name: 'Hold Hover',
          description: 'test',
          confidence: 0.4,
          action: 'record',
          matcher: {
            type: 'interaction-hold',
            params: { state: 'Hover' },
          },
          holdMs: 300,
          cooldownMs: 0,
        }),
      ],
      commandFactories: [
        createCallbackCommandFactory('record', (ctx) => {
          executed.push(ctx.match.definition.id)
        }),
      ],
    })

    const base = snapshotWith({
      state: 'Hover',
      previousState: 'Hover',
      features: {
        ...createIdleGestureFeatures(),
        present: true,
        confidence: 0.9,
      },
    })

    await recognizer.update({ ...base, timestampMs: 1000 })
    expect(executed).toHaveLength(0)

    await recognizer.update({ ...base, timestampMs: 1200 })
    expect(executed).toHaveLength(0)

    await recognizer.update({ ...base, timestampMs: 1350 })
    expect(executed).toEqual(['hold-hover'])
  })

  it('blocks exclusive-group peers after one pose fires', async () => {
    const executed: string[] = []

    const recognizer = createGestureRecognizer({
      definitions: [
        createGestureDefinition({
          id: 'pose-a',
          name: 'Pose A',
          description: 'test',
          confidence: 0.4,
          action: 'record',
          matcher: {
            type: 'interaction-enter',
            params: { state: 'Hover' },
          },
          holdMs: 0,
          cooldownMs: 2000,
          exclusiveGroup: 'poses',
        }),
        createGestureDefinition({
          id: 'pose-b',
          name: 'Pose B',
          description: 'test',
          confidence: 0.4,
          action: 'record',
          matcher: {
            type: 'interaction-enter',
            params: { state: 'Pinch' },
          },
          holdMs: 0,
          cooldownMs: 2000,
          exclusiveGroup: 'poses',
        }),
      ],
      commandFactories: [
        createCallbackCommandFactory('record', (ctx) => {
          executed.push(ctx.match.definition.id)
        }),
      ],
    })

    await recognizer.update(
      snapshotWith({
        state: 'Hover',
        previousState: 'Tracking',
        changed: true,
        features: {
          ...createIdleGestureFeatures(),
          present: true,
          confidence: 0.9,
        },
      }),
    )
    expect(executed).toEqual(['pose-a'])

    await recognizer.update({
      ...snapshotWith({
        state: 'Pinch',
        previousState: 'Hover',
        changed: true,
        features: {
          ...createIdleGestureFeatures(),
          present: true,
          confidence: 0.95,
          pinch: { active: true, strength: 0.9, distance: 0.02 },
        },
      }),
      timestampMs: 1300,
    })

    // Still blocked by exclusive group cooldown (~900ms+).
    expect(executed).toEqual(['pose-a'])
  })

  it('blocks rock/clear longer after Drawing than other pose commands', async () => {
    const executed: string[] = []

    const recognizer = createGestureRecognizer({
      definitions: [
        createGestureDefinition({
          id: 'rock',
          name: 'Rock',
          description: 'clear',
          confidence: 0.4,
          action: 'record',
          matcher: {
            type: 'interaction-hold',
            params: { state: 'Hover' },
          },
          holdMs: 0,
          cooldownMs: 0,
          exclusiveGroup: 'hand-pose',
        }),
        createGestureDefinition({
          id: 'fist',
          name: 'Fist',
          description: 'color',
          confidence: 0.4,
          action: 'record',
          matcher: {
            type: 'interaction-enter',
            params: { state: 'Tracking' },
          },
          holdMs: 0,
          cooldownMs: 0,
          exclusiveGroup: 'hand-pose',
        }),
      ],
      commandFactories: [
        createCallbackCommandFactory('record', (ctx) => {
          executed.push(ctx.match.definition.id)
        }),
      ],
    })

    // Leave Drawing — starts clear guard (~1100ms) and ink guard (~450ms).
    await recognizer.update(
      snapshotWith({
        state: 'Released',
        previousState: 'Drawing',
        changed: true,
        features: {
          ...createIdleGestureFeatures(),
          present: true,
          confidence: 0.95,
        },
      }),
    )
    expect(executed).toEqual([])

    // 600ms later: ink guard expired, but clear guard still blocks rock.
    await recognizer.update({
      ...snapshotWith({
        state: 'Hover',
        previousState: 'Hover',
        changed: false,
        features: {
          ...createIdleGestureFeatures(),
          present: true,
          confidence: 0.95,
        },
      }),
      timestampMs: 1600,
    })
    expect(executed).toEqual([])

    // After clear guard (~1100ms from last Drawing-adjacent frame).
    await recognizer.update({
      ...snapshotWith({
        state: 'Hover',
        previousState: 'Hover',
        changed: false,
        features: {
          ...createIdleGestureFeatures(),
          present: true,
          confidence: 0.95,
        },
      }),
      timestampMs: 2200,
    })
    expect(executed).toEqual(['rock'])
  })
})
