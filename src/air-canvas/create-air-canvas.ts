import { DEFAULT_AIR_CANVAS_SETTINGS } from './defaults'
import { fillBackground, paintStroke } from './paint'
import { appendStrokePoint, createStroke } from './stroke'
import type {
  AirCanvasEngine,
  AirCanvasPoint,
  AirCanvasSettings,
  AirCanvasStroke,
  CreateAirCanvasOptions,
} from './types'

/** Rejoin stroke fragments when pinch tracking drops mid-line. */
const STROKE_RESUME_MS = 700
const STROKE_RESUME_DISTANCE = 0.35
/** Keep ink alive after leaving Drawing (frames ≈ vision updates). */
const INK_RELEASE_GRACE_FRAMES = 12

function pointDistance(a: AirCanvasPoint, b: AirCanvasPoint): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

/**
 * AirCanvas engine — freehand ink via Canvas API.
 * No React. Driven by Gesture Engine states + cursor points.
 */
export function createAirCanvas(
  options: CreateAirCanvasOptions = {},
): AirCanvasEngine {
  let settings: AirCanvasSettings = {
    ...DEFAULT_AIR_CANVAS_SETTINGS,
    ...options,
  }

  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let cssWidth = 1
  let cssHeight = 1
  let pixelRatio = 1

  const strokes: AirCanvasStroke[] = []
  let activeStroke: AirCanvasStroke | null = null
  let lastStrokeEndedAt = 0
  let lastStrokeEndPoint: AirCanvasPoint | null = null
  let framesWithoutInk = 0

  const ensureContext = () => {
    if (!canvas) {
      throw new Error('AirCanvas is not attached to a canvas element.')
    }
    if (!ctx) {
      ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to acquire 2D context for AirCanvas.')
      }
    }
    return { canvas, ctx }
  }

  const applySize = () => {
    if (!canvas) return
    const width = Math.max(1, Math.round(cssWidth * pixelRatio))
    const height = Math.max(1, Math.round(cssHeight * pixelRatio))
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
    const context = ensureContext().ctx
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    redraw()
  }

  const redraw = () => {
    if (!canvas || !ctx) return
    fillBackground(ctx, canvas.width, canvas.height, settings.background)
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    for (const stroke of strokes) {
      paintStroke(ctx, stroke, cssWidth, cssHeight)
    }
    if (activeStroke) {
      paintStroke(ctx, activeStroke, cssWidth, cssHeight)
    }
  }

  const currentStyle = () => ({
    tool: settings.tool,
    color: settings.color,
    thickness: settings.thickness,
  })

  const tryResumeStroke = (point: AirCanvasPoint): boolean => {
    if (activeStroke || strokes.length === 0 || !lastStrokeEndPoint) {
      return false
    }
    const elapsed = Date.now() - lastStrokeEndedAt
    if (elapsed > STROKE_RESUME_MS) return false
    if (pointDistance(point, lastStrokeEndPoint) > STROKE_RESUME_DISTANCE) {
      return false
    }

    const previous = strokes.pop()
    if (!previous) return false

    const style = currentStyle()
    if (
      previous.style.tool !== style.tool ||
      previous.style.color !== style.color ||
      previous.style.thickness !== style.thickness
    ) {
      strokes.push(previous)
      return false
    }

    activeStroke = appendStrokePoint(previous, point)
    lastStrokeEndPoint = null
    redraw()
    return true
  }

  const engine: AirCanvasEngine = {
    attach(nextCanvas) {
      canvas = nextCanvas
      ctx = nextCanvas.getContext('2d')
      cssWidth = nextCanvas.clientWidth || nextCanvas.width || 1
      cssHeight = nextCanvas.clientHeight || nextCanvas.height || 1
      pixelRatio =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      applySize()
    },

    detach() {
      canvas = null
      ctx = null
      activeStroke = null
      lastStrokeEndedAt = 0
      lastStrokeEndPoint = null
      framesWithoutInk = 0
    },

    setSize(width, height) {
      cssWidth = Math.max(1, width)
      cssHeight = Math.max(1, height)
      pixelRatio =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      applySize()
    },

    setTool(tool) {
      settings = { ...settings, tool }
    },

    setColor(color) {
      settings = { ...settings, color }
    },

    setThickness(thickness) {
      settings = {
        ...settings,
        thickness: Math.max(1, thickness),
      }
    },

    beginStroke(point) {
      if (activeStroke) {
        engine.endStroke()
      }
      if (tryResumeStroke(point)) {
        framesWithoutInk = 0
        return
      }
      activeStroke = createStroke(currentStyle(), point)
      framesWithoutInk = 0
      redraw()
    },

    continueStroke(point) {
      if (!activeStroke) {
        engine.beginStroke(point)
        return
      }
      activeStroke = appendStrokePoint(activeStroke, point)
      redraw()
    },

    endStroke() {
      if (!activeStroke) return
      const last = activeStroke.points[activeStroke.points.length - 1]
      lastStrokeEndPoint = last ? { ...last } : null
      lastStrokeEndedAt = Date.now()
      strokes.push(activeStroke)
      activeStroke = null
      framesWithoutInk = 0
      redraw()
    },

    handleInteraction({ state, point }) {
      const wantsInk = state === 'Drawing'

      if (wantsInk && point) {
        framesWithoutInk = 0
        if (!activeStroke) {
          engine.beginStroke(point)
        } else {
          activeStroke = appendStrokePoint(activeStroke, point)
          redraw()
        }
        return
      }

      // Sticky ink through brief Drawing dropouts from pinch noise.
      if (activeStroke) {
        framesWithoutInk += 1

        if (framesWithoutInk <= INK_RELEASE_GRACE_FRAMES) {
          if (point) {
            activeStroke = appendStrokePoint(activeStroke, point)
            redraw()
          }
          return
        }

        engine.endStroke()
      }
    },

    clear() {
      strokes.length = 0
      activeStroke = null
      lastStrokeEndedAt = 0
      lastStrokeEndPoint = null
      framesWithoutInk = 0
      redraw()
    },

    toDataURL(type = 'image/png', quality) {
      const { canvas: target } = ensureContext()
      return target.toDataURL(type, quality)
    },

    toBlob(type = 'image/png', quality) {
      const { canvas: target } = ensureContext()
      return new Promise<Blob>((resolve, reject) => {
        target.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to export AirCanvas PNG.'))
              return
            }
            resolve(blob)
          },
          type,
          quality,
        )
      })
    },

    downloadPng(filename = 'aircanvas.png') {
      const dataUrl = engine.toDataURL('image/png')
      if (typeof document === 'undefined') {
        throw new Error('downloadPng requires a DOM document.')
      }
      const anchor = document.createElement('a')
      anchor.href = dataUrl
      anchor.download = filename
      anchor.click()
    },

    isStrokeActive: () => activeStroke !== null,

    getSettings: () => settings,

    getStrokes: () => [...strokes, ...(activeStroke ? [activeStroke] : [])],
  }

  return engine
}

export type { AirCanvasPoint }
