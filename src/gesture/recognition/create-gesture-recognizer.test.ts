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
})
