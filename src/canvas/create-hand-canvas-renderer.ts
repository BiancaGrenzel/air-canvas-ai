import { HAND_BONES, HAND_FINGERTIPS, HandLandmarkIndex } from '@/domain'

import { resolveHandCanvasStyle } from './styles'
import type {
  CreateHandCanvasRendererOptions,
  DrawHand,
  DrawHandsFrame,
  DrawLandmark,
  HandCanvasRenderer,
} from './types'

type Point = { x: number; y: number }

/**
 * Pure Canvas renderer for hand skeletons.
 * Receives landmark data and draws bones, joints, lines, and indicators.
 * Contains zero AI / vision / React logic.
 */
export function createHandCanvasRenderer(
  canvas: HTMLCanvasElement,
  options: CreateHandCanvasRendererOptions = {},
): HandCanvasRenderer {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to acquire 2D canvas context for hand renderer.')
  }

  const style = resolveHandCanvasStyle(options.style)
  let cssWidth = canvas.clientWidth || canvas.width || 1
  let cssHeight = canvas.clientHeight || canvas.height || 1
  let pixelRatio =
    options.pixelRatio ??
    (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)

  const applySize = () => {
    const width = Math.max(1, Math.round(cssWidth * pixelRatio))
    const height = Math.max(1, Math.round(cssHeight * pixelRatio))
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  }

  applySize()

  const toPoint = (landmark: DrawLandmark, mirrored: boolean): Point => ({
    x: (mirrored ? 1 - landmark.x : landmark.x) * cssWidth,
    y: landmark.y * cssHeight,
  })

  const paletteFor = (handedness: string) => {
    const key = handedness.trim().toLowerCase()
    if (key === 'left') {
      return {
        bone: style.leftBoneColor,
        joint: style.leftJointColor,
      }
    }
    if (key === 'right') {
      return {
        bone: style.rightBoneColor,
        joint: style.rightJointColor,
      }
    }
    return {
      bone: style.unknownBoneColor,
      joint: style.unknownJointColor,
    }
  }

  const drawBones = (hand: DrawHand, mirrored: boolean) => {
    if (!style.showBones) return
    const { bone } = paletteFor(hand.handedness)

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = bone
    ctx.lineWidth = style.boneWidth

    for (const [startIndex, endIndex] of HAND_BONES) {
      const start = hand.landmarks[startIndex]
      const end = hand.landmarks[endIndex]
      if (!start || !end) continue

      const from = toPoint(start, mirrored)
      const to = toPoint(end, mirrored)

      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
    }
  }

  const drawJoints = (hand: DrawHand, mirrored: boolean) => {
    if (!style.showJoints) return
    const { joint } = paletteFor(hand.handedness)
    const fingertips = new Set(HAND_FINGERTIPS)

    hand.landmarks.forEach((landmark, index) => {
      const point = toPoint(landmark, mirrored)
      let radius = style.jointRadius

      if (index === HandLandmarkIndex.WRIST) {
        radius = style.wristRadius
      } else if (style.showFingertipMarkers && fingertips.has(index)) {
        radius = style.fingertipRadius
      }

      ctx.beginPath()
      ctx.fillStyle = joint
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.strokeStyle = 'rgb(255 255 255 / 55%)'
      ctx.lineWidth = 1
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
      ctx.stroke()
    })
  }

  const drawIndicator = (hand: DrawHand, mirrored: boolean) => {
    if (!style.showIndicators) return

    const wrist = hand.landmarks[HandLandmarkIndex.WRIST]
    if (!wrist) return

    const anchor = toPoint(wrist, mirrored)
    const label = `${hand.handedness} · ${(hand.confidence * 100).toFixed(0)}%`

    ctx.font = style.indicatorFont
    ctx.textBaseline = 'middle'
    const textWidth = ctx.measureText(label).width
    const boxWidth = textWidth + style.indicatorPaddingX * 2
    const boxHeight = 20
    const offsetY = -(style.wristRadius + 14)

    let boxX = anchor.x - boxWidth / 2
    let boxY = anchor.y + offsetY - boxHeight / 2

    boxX = Math.min(Math.max(4, boxX), cssWidth - boxWidth - 4)
    boxY = Math.min(Math.max(4, boxY), cssHeight - boxHeight - 4)

    ctx.beginPath()
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 6)
    ctx.fillStyle = style.indicatorBackground
    ctx.fill()

    const { bone } = paletteFor(hand.handedness)
    ctx.beginPath()
    ctx.fillStyle = bone
    ctx.arc(boxX + 10, boxY + boxHeight / 2, 3.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = style.indicatorText
    ctx.fillText(label, boxX + 18, boxY + boxHeight / 2 + 0.5)
  }

  const clear = () => {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }

  return {
    getContext: () => ctx,

    setSize(nextWidth, nextHeight) {
      cssWidth = Math.max(1, nextWidth)
      cssHeight = Math.max(1, nextHeight)
      pixelRatio =
        options.pixelRatio ??
        (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
      applySize()
    },

    clear,

    draw(frame: DrawHandsFrame) {
      clear()
      const mirrored = Boolean(frame.mirrored)

      for (const hand of frame.hands) {
        if (!hand.landmarks.length) continue
        drawBones(hand, mirrored)
        drawJoints(hand, mirrored)
        drawIndicator(hand, mirrored)
      }
    },
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}
