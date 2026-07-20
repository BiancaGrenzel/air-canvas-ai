import type {
  AirCanvasPoint,
  AirCanvasStroke,
  AirCanvasStrokeStyle,
} from './types'

export function createStrokeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `stroke-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createStroke(
  style: AirCanvasStrokeStyle,
  point: AirCanvasPoint,
): AirCanvasStroke {
  return {
    id: createStrokeId(),
    style: { ...style },
    points: [point],
  }
}

export function appendStrokePoint(
  stroke: AirCanvasStroke,
  point: AirCanvasPoint,
): AirCanvasStroke {
  const last = stroke.points[stroke.points.length - 1]
  if (last && last.x === point.x && last.y === point.y) {
    return stroke
  }

  return {
    ...stroke,
    points: [...stroke.points, point],
  }
}

/**
 * Remove the upward "hook" captured while opening a pinch to stop drawing.
 * Trims trailing segments that diverge from the stroke body direction.
 * Does not trim intentional upward strokes (body already goes up).
 */
export function trimReleaseFlick(
  stroke: AirCanvasStroke,
  options: { maxTrimPoints?: number; minCosine?: number } = {},
): AirCanvasStroke {
  const maxTrimPoints = options.maxTrimPoints ?? 10
  const minCosine = options.minCosine ?? 0.35
  const points = stroke.points

  if (points.length < 6) return stroke

  const bodyStart = Math.floor(points.length * 0.35)
  const bodyEnd = Math.max(bodyStart + 1, Math.floor(points.length * 0.8))
  const bodyA = points[bodyStart]
  const bodyB = points[bodyEnd]
  if (!bodyA || !bodyB) return stroke

  const bodyDx = bodyB.x - bodyA.x
  const bodyDy = bodyB.y - bodyA.y
  const bodyLen = Math.hypot(bodyDx, bodyDy)

  // Screen Y grows downward — intentional upstrokes must keep their tip.
  const bodyMostlyUp = bodyDy < -Math.abs(bodyDx) * 0.4
  if (bodyMostlyUp) return stroke

  const trimmed = [...points]
  let removed = 0

  // Always drop a couple of release samples on longer strokes.
  const forced = trimmed.length >= 10 ? 2 : trimmed.length >= 6 ? 1 : 0
  while (removed < forced && trimmed.length > 3) {
    trimmed.pop()
    removed += 1
  }

  if (bodyLen > 1e-4) {
    while (removed < maxTrimPoints && trimmed.length > 4) {
      const a = trimmed[trimmed.length - 2]
      const b = trimmed[trimmed.length - 1]
      if (!a || !b) break

      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.hypot(dx, dy)
      if (len < 1e-6) {
        trimmed.pop()
        removed += 1
        continue
      }

      const cosine = (bodyDx * dx + bodyDy * dy) / (bodyLen * len)
      // Release flick: tip goes up (or sideways) vs a non-upward body.
      const tipGoesUp = dy < -Math.abs(dx) * 0.25
      if (cosine < minCosine && tipGoesUp) {
        trimmed.pop()
        removed += 1
        continue
      }
      break
    }
  }

  if (removed === 0) return stroke

  return {
    ...stroke,
    points: trimmed,
  }
}

export function toCanvasPoint(
  point: AirCanvasPoint,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: point.x * width,
    y: point.y * height,
  }
}
