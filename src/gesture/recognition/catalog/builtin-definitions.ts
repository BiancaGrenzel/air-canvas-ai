import { createGestureDefinition, type GestureDefinition } from '@/domain'

const POSE_GROUP = 'hand-pose'

/**
 * Built-in catalog — also the shape future JSON user gestures will use.
 * `action` ids are resolved by the Action Engine (no coupling to @/actions).
 */
export function createBuiltinGestureDefinitions(): GestureDefinition[] {
  return [
    createGestureDefinition({
      id: 'rock',
      name: 'Rock',
      description: 'Clear the AirCanvas drawing surface.',
      confidence: 0.85,
      action: 'canvas.clear',
      matcher: {
        type: 'landmark-rock',
        params: { minScore: 0.85 },
      },
      holdMs: 220,
      cooldownMs: 1400,
      exclusiveGroup: POSE_GROUP,
    }),
    createGestureDefinition({
      id: 'fist',
      name: 'Fist',
      description: 'Cycle brush color.',
      confidence: 0.7,
      action: 'canvas.set-color',
      matcher: {
        type: 'landmark-fist',
        params: { minScore: 0.7 },
      },
      holdMs: 160,
      cooldownMs: 900,
      exclusiveGroup: POSE_GROUP,
    }),
    createGestureDefinition({
      id: 'victory',
      name: 'Victory',
      description: 'Save the canvas as PNG.',
      confidence: 0.85,
      action: 'canvas.save',
      matcher: {
        type: 'landmark-victory',
        params: { minScore: 0.85 },
      },
      holdMs: 320,
      cooldownMs: 1800,
      exclusiveGroup: POSE_GROUP,
    }),
    createGestureDefinition({
      id: 'pinch-tap',
      name: 'Pinch Tap',
      description: 'Quick pinch to change brush color.',
      confidence: 0.65,
      action: 'canvas.set-color',
      matcher: {
        type: 'pinch-tap',
        params: { maxTravel: 0.018 },
      },
      cooldownMs: 1200,
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
