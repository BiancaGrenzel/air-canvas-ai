/**
 * Cursor Engine — virtual cursor from finger/pointer position.
 * Independent of React. Uses One Euro Filter for smoothing.
 */

export {
  createCursorEngine,
  DEFAULT_CURSOR_BOUNDS,
  DEFAULT_CURSOR_ENGINE_CONFIG,
  DEFAULT_ONE_EURO,
} from './create-cursor-engine'

export {
  applyAcceleration,
  clampToBounds,
  mapCursorInput,
  mapUnitToBounds,
} from './mapping'

export { OneEuroFilter1D, OneEuroFilter2D } from './one-euro-filter'

export { clamp, lerp } from './math'

export type {
  CreateCursorEngineOptions,
  CursorBounds,
  CursorEngine,
  CursorEngineConfig,
  CursorInput,
  CursorPoint,
  OneEuroFilterConfig,
} from './types'
