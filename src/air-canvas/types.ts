import type { InteractionState } from '@/domain'

export type AirCanvasPoint = {
  readonly x: number
  readonly y: number
}

export type AirCanvasTool = 'brush' | 'eraser'

export type AirCanvasStrokeStyle = {
  readonly tool: AirCanvasTool
  readonly color: string
  readonly thickness: number
}

export type AirCanvasStroke = {
  readonly id: string
  readonly style: AirCanvasStrokeStyle
  readonly points: readonly AirCanvasPoint[]
}

export type AirCanvasSettings = {
  readonly tool: AirCanvasTool
  readonly color: string
  readonly thickness: number
  readonly background: string
}

export type AirCanvasInteractionInput = {
  readonly state: InteractionState
  readonly point: AirCanvasPoint | null
}

export type DrawAction = 'begin' | 'continue' | 'end' | 'none'

export type AirCanvasEngine = {
  attach: (canvas: HTMLCanvasElement) => void
  detach: () => void
  setSize: (cssWidth: number, cssHeight: number) => void
  setTool: (tool: AirCanvasTool) => void
  setColor: (color: string) => void
  setThickness: (thickness: number) => void
  beginStroke: (point: AirCanvasPoint) => void
  continueStroke: (point: AirCanvasPoint) => void
  endStroke: () => void
  /**
   * Sync with Gesture Engine + Cursor Engine.
   * Drawing → paint; Hover (or any non-Drawing) → stop.
   */
  handleInteraction: (input: AirCanvasInteractionInput) => void
  clear: () => void
  toDataURL: (type?: string, quality?: number) => string
  toBlob: (type?: string, quality?: number) => Promise<Blob>
  downloadPng: (filename?: string) => void
  isStrokeActive: () => boolean
  getSettings: () => AirCanvasSettings
  getStrokes: () => readonly AirCanvasStroke[]
}

export type CreateAirCanvasOptions = Partial<AirCanvasSettings>
