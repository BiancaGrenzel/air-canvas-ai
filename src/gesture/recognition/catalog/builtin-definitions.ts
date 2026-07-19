import { createGestureDefinition, type GestureDefinition } from '@/domain'

/**
 * Built-in catalog — also the shape future JSON user gestures will use.
 * `action` ids are resolved by the Action Engine (no coupling to @/actions).
 */
export function createBuiltinGestureDefinitions(): GestureDefinition[] {
  return [
    createGestureDefinition({
      id: 'open-palm',
      name: 'Open Palm',
      description: 'Clear the AirCanvas drawing surface.',
      confidence: 0.7,
      action: 'canvas.clear',
      matcher: {
        type: 'landmark-open-palm',
        params: { minScore: 0.75 },
      },
      cooldownMs: 1500,
    }),
    createGestureDefinition({
      id: 'fist',
      name: 'Fist',
      description: 'Cycle brush color.',
      confidence: 0.7,
      action: 'canvas.set-color',
      matcher: {
        type: 'landmark-fist',
        params: { minScore: 0.75 },
      },
      cooldownMs: 1000,
    }),
    createGestureDefinition({
      id: 'victory',
      name: 'Victory',
      description: 'Save the canvas as PNG.',
      confidence: 0.7,
      action: 'canvas.save',
      matcher: {
        type: 'landmark-victory',
        params: { minScore: 0.75 },
      },
      cooldownMs: 1500,
    }),
    createGestureDefinition({
      id: 'pinch-tap',
      name: 'Pinch Tap',
      description: 'Quick pinch to change brush color.',
      confidence: 0.55,
      action: 'canvas.set-color',
      matcher: {
        type: 'pinch-tap',
        params: { maxTravel: 0.035 },
      },
      cooldownMs: 700,
    }),
    createGestureDefinition({
      id: 'enter-drawing',
      name: 'Start Drawing',
      description: 'Entered the Drawing interaction state.',
      confidence: 0.5,
      action: 'log',
      matcher: {
        type: 'interaction-enter',
        params: { state: 'Drawing' },
      },
      cooldownMs: 500,
    }),
  ]
}
