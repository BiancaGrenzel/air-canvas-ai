import type { CanvasActionPort } from '@/application/ports'

import { createActionDefinition } from '../../create-action-engine'
import type { ActionCommand } from '../../types'

export const CANVAS_ACTION_IDS = {
  setColor: 'canvas.set-color',
  clear: 'canvas.clear',
  save: 'canvas.save',
} as const

export type CreateCanvasActionsOptions = {
  /** Palette used when cycling colors (no explicit params.color). */
  palette?: readonly string[]
}

export function createCanvasActions(
  port: CanvasActionPort,
  options: CreateCanvasActionsOptions = {},
): ActionCommand[] {
  const palette = options.palette ?? [
    '#09090b',
    '#3b63f3',
    '#dc2626',
    '#16a34a',
    '#f59e0b',
    '#ffffff',
  ]
  let paletteIndex = 0

  return [
    {
      id: CANVAS_ACTION_IDS.setColor,
      definition: createActionDefinition({
        id: CANVAS_ACTION_IDS.setColor,
        name: 'Change Color',
        description: 'Set brush color or cycle the palette.',
        domain: 'canvas',
        enabled: true,
      }),
      execute(context) {
        const explicit = context?.params?.color
        if (typeof explicit === 'string' && explicit.length > 0) {
          port.setColor(explicit)
          return
        }

        paletteIndex = (paletteIndex + 1) % palette.length
        const next = palette[paletteIndex] ?? palette[0]!
        port.setColor(next)
      },
    },
    {
      id: CANVAS_ACTION_IDS.clear,
      definition: createActionDefinition({
        id: CANVAS_ACTION_IDS.clear,
        name: 'Clear Canvas',
        description: 'Erase all strokes from the drawing surface.',
        domain: 'canvas',
        enabled: true,
      }),
      execute() {
        port.clear()
      },
    },
    {
      id: CANVAS_ACTION_IDS.save,
      definition: createActionDefinition({
        id: CANVAS_ACTION_IDS.save,
        name: 'Save Image',
        description: 'Export the canvas as a PNG file.',
        domain: 'canvas',
        enabled: true,
      }),
      async execute(context) {
        const filename =
          typeof context?.params?.filename === 'string'
            ? context.params.filename
            : undefined
        await port.saveImage(filename)
      },
    },
  ]
}
