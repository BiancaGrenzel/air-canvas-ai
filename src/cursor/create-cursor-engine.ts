import { clampToBounds, mapCursorInput } from './mapping'
import { OneEuroFilter2D } from './one-euro-filter'
import type {
  CreateCursorEngineOptions,
  CursorEngine,
  CursorEngineConfig,
  CursorPoint,
} from './types'

export const DEFAULT_CURSOR_BOUNDS = {
  minX: 0,
  minY: 0,
  maxX: 1,
  maxY: 1,
} as const

export const DEFAULT_ONE_EURO = {
  minCutoff: 1.0,
  beta: 0.007,
  dCutoff: 1.0,
} as const

export const DEFAULT_CURSOR_ENGINE_CONFIG: CursorEngineConfig = {
  sensitivity: 1.25,
  acceleration: 0.35,
  bounds: DEFAULT_CURSOR_BOUNDS,
  oneEuro: DEFAULT_ONE_EURO,
  mirrored: true,
}

/**
 * Cursor Engine — index-finger (or pointer) position → smoothed virtual cursor.
 * Framework-agnostic: no React, no DOM.
 */
export function createCursorEngine(
  options: CreateCursorEngineOptions = {},
): CursorEngine {
  let config = mergeConfig(DEFAULT_CURSOR_ENGINE_CONFIG, options)
  let filter = createFilter(config)
  let position: CursorPoint | null = null

  return {
    getConfig: () => config,

    getPosition: () => position,

    setConfig(partial) {
      config = mergeConfig(config, partial)
      filter = createFilter(config)
      if (position) {
        position = clampToBounds(position, config.bounds)
      }
    },

    reset() {
      filter.reset()
      position = null
    },

    update(input) {
      const mapped = mapCursorInput(
        { x: input.x, y: input.y },
        {
          mirrored: config.mirrored,
          sensitivity: config.sensitivity,
          acceleration: config.acceleration,
          bounds: config.bounds,
        },
      )

      const smoothed = filter.filter(mapped, input.timestampMs)
      position = clampToBounds(smoothed, config.bounds)
      return position
    },
  }
}

function createFilter(config: CursorEngineConfig) {
  return new OneEuroFilter2D({
    minCutoff: config.oneEuro.minCutoff,
    beta: config.oneEuro.beta,
    dCutoff: config.oneEuro.dCutoff,
  })
}

function mergeConfig(
  base: CursorEngineConfig,
  partial: CreateCursorEngineOptions,
): CursorEngineConfig {
  return {
    sensitivity: partial.sensitivity ?? base.sensitivity,
    acceleration: partial.acceleration ?? base.acceleration,
    mirrored: partial.mirrored ?? base.mirrored,
    bounds: {
      ...base.bounds,
      ...partial.bounds,
    },
    oneEuro: {
      ...base.oneEuro,
      ...partial.oneEuro,
    },
  }
}
