/**
 * AirCanvas — freehand drawing driven by Gesture Engine states.
 * Logic is framework-agnostic; React only mounts the surface.
 */

export { createAirCanvas } from './create-air-canvas'

export { resolveDrawAction } from './interaction'

export {
  AIR_CANVAS_COLOR_PRESETS,
  DEFAULT_AIR_CANVAS_SETTINGS,
} from './defaults'

export { appendStrokePoint, createStroke, toCanvasPoint } from './stroke'

export { AirCanvasSurface } from './components'
export type { AirCanvasSurfaceProps } from './components'

export type {
  AirCanvasEngine,
  AirCanvasInteractionInput,
  AirCanvasPoint,
  AirCanvasSettings,
  AirCanvasStroke,
  AirCanvasStrokeStyle,
  AirCanvasTool,
  CreateAirCanvasOptions,
  DrawAction,
} from './types'
