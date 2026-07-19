import type { AirCanvasStroke, AirCanvasStrokeStyle } from './types'
import { toCanvasPoint } from './stroke'

export function paintStroke(
  ctx: CanvasRenderingContext2D,
  stroke: AirCanvasStroke,
  cssWidth: number,
  cssHeight: number,
) {
  if (stroke.points.length === 0) return

  applyStrokeStyle(ctx, stroke.style)

  if (stroke.points.length === 1) {
    const point = toCanvasPoint(stroke.points[0]!, cssWidth, cssHeight)
    ctx.beginPath()
    ctx.arc(point.x, point.y, stroke.style.thickness / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  ctx.beginPath()
  const first = toCanvasPoint(stroke.points[0]!, cssWidth, cssHeight)
  ctx.moveTo(first.x, first.y)

  for (let index = 1; index < stroke.points.length; index += 1) {
    const point = toCanvasPoint(stroke.points[index]!, cssWidth, cssHeight)
    ctx.lineTo(point.x, point.y)
  }

  ctx.stroke()
}

export function applyStrokeStyle(
  ctx: CanvasRenderingContext2D,
  style: AirCanvasStrokeStyle,
) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = style.thickness

  if (style.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
    ctx.fillStyle = 'rgba(0,0,0,1)'
    return
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = style.color
  ctx.fillStyle = style.color
}

export function fillBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: string,
) {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}
