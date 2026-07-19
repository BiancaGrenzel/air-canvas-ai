import { describe, expect, it, vi } from 'vitest'

import type { CanvasActionPort } from '@/application/ports'

import { createActionEngine } from './create-action-engine'
import { createCanvasActions } from './commands/canvas/canvas-actions'
import { createFutureActionPlaceholders } from './commands/future-placeholders'

describe('createActionEngine', () => {
  it('dispatches canvas.clear through the registry', async () => {
    const port: CanvasActionPort = {
      setColor: vi.fn(),
      getColor: () => '#000',
      clear: vi.fn(),
      saveImage: vi.fn(),
    }

    const engine = createActionEngine({
      commands: createCanvasActions(port),
    })

    await engine.dispatch('canvas.clear', { source: 'ui' })
    expect(port.clear).toHaveBeenCalledOnce()
  })

  it('cycles colors when canvas.set-color has no explicit color', async () => {
    let color = '#09090b'
    const port: CanvasActionPort = {
      setColor: (next) => {
        color = next
      },
      getColor: () => color,
      clear: vi.fn(),
      saveImage: vi.fn(),
    }

    const engine = createActionEngine({
      commands: createCanvasActions(port, {
        palette: ['#111111', '#222222'],
      }),
    })

    await engine.dispatch('canvas.set-color')
    expect(color).toBe('#222222')
    await engine.dispatch('canvas.set-color')
    expect(color).toBe('#111111')
  })

  it('lists future placeholders as disabled', () => {
    const engine = createActionEngine({
      commands: createFutureActionPlaceholders(),
    })

    const spotify = engine
      .list()
      .find((item) => item.id === 'spotify.play-pause')
    expect(spotify?.enabled).toBe(false)
    expect(spotify?.domain).toBe('media')
  })

  it('skips disabled actions on dispatch', async () => {
    const engine = createActionEngine({
      commands: createFutureActionPlaceholders(),
    })

    await expect(engine.dispatch('spotify.play-pause')).resolves.toBeUndefined()
  })
})
