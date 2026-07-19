import { clamp, lerp, sign } from './math'
import type { CursorBounds, CursorPoint } from './types'

export type MapCursorInputOptions = {
  mirrored: boolean
  sensitivity: number
  acceleration: number
  bounds: CursorBounds
}

/**
 * Pure mapping: hand-normalized point → target cursor space (pre-smoothing).
 *
 * 1. Optional mirror on X
 * 2. Sensitivity scales offset from center (0.5, 0.5)
 * 3. Acceleration applies non-linear gain on distance from center
 * 4. Linear map into bounds rectangle
 */
export function mapCursorInput(
  input: CursorPoint,
  options: MapCursorInputOptions,
): CursorPoint {
  const x = options.mirrored ? 1 - input.x : input.x
  const y = input.y

  const sensitiveX = 0.5 + (x - 0.5) * options.sensitivity
  const sensitiveY = 0.5 + (y - 0.5) * options.sensitivity

  const accelerated = applyAcceleration(
    { x: sensitiveX, y: sensitiveY },
    options.acceleration,
  )

  return mapUnitToBounds(accelerated, options.bounds)
}

export function applyAcceleration(
  point: CursorPoint,
  acceleration: number,
): CursorPoint {
  if (acceleration <= 0) {
    return point
  }

  const dx = point.x - 0.5
  const dy = point.y - 0.5
  const distance = Math.hypot(dx, dy)

  if (distance < 1e-9) {
    return point
  }

  // Power-like gain: farther from center → larger step.
  const gain = 1 + acceleration * distance
  return {
    x: 0.5 + dx * gain,
    y: 0.5 + dy * gain,
  }
}

export function mapUnitToBounds(
  point: CursorPoint,
  bounds: CursorBounds,
): CursorPoint {
  return {
    x: lerp(bounds.minX, bounds.maxX, point.x),
    y: lerp(bounds.minY, bounds.maxY, point.y),
  }
}

export function clampToBounds(
  point: CursorPoint,
  bounds: CursorBounds,
): CursorPoint {
  return {
    x: clamp(point.x, bounds.minX, bounds.maxX),
    y: clamp(point.y, bounds.minY, bounds.maxY),
  }
}

/** Distance-preserving radial scale helper used in tests. */
export function radialScale(point: CursorPoint, factor: number): CursorPoint {
  const dx = point.x - 0.5
  const dy = point.y - 0.5
  return {
    x: 0.5 + dx * factor,
    y: 0.5 + dy * factor,
  }
}

export function directedMagnitude(value: number, magnitude: number): number {
  return sign(value) * magnitude
}
