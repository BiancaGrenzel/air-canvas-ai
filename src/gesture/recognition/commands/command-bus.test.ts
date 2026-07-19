import { describe, expect, it } from 'vitest'

import { createGestureDefinition } from '@/domain'

import {
  createCallbackCommandFactory,
  createGestureCommandBus,
} from './command-bus'
import { createNoopCommandFactory } from './builtin-commands'

describe('GestureCommandBus', () => {
  it('dispatches by action id without a switch', async () => {
    const calls: string[] = []
    const bus = createGestureCommandBus()
    bus.register(createNoopCommandFactory())
    bus.register(
      createCallbackCommandFactory('wave', () => {
        calls.push('wave')
      }),
    )

    await bus.execute('wave', {
      match: {
        definition: createGestureDefinition({
          id: 'x',
          name: 'X',
          description: '',
          confidence: 0.5,
          action: 'wave',
          matcher: { type: 'interaction-hold' },
        }),
        confidence: 0.9,
        timestampMs: 1,
        trackId: null,
      },
    })

    expect(calls).toEqual(['wave'])
    expect(bus.listActionIds()).toContain('wave')
    expect(bus.listActionIds()).toContain('noop')
  })
})
