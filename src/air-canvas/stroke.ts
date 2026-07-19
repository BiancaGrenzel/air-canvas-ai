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
