export type CursorPoint = {
  readonly x: number
  readonly y: number
}

export type CursorBounds = {
  readonly minX: number
  readonly minY: number
  readonly maxX: number
  readonly maxY: number
}

export type OneEuroFilterConfig = {
  /** Minimum cutoff frequency (Hz). Lower = smoother when still. */
  readonly minCutoff: number
  /** Speed coefficient. Higher = less lag when moving fast. */
  readonly beta: number
  /** Cutoff for derivative filter. */
  readonly dCutoff: number
}

export type CursorEngineConfig = {
  /** Gain around the center of the input space. 1 = neutral. */
  readonly sensitivity: number
  /** Non-linear gain on distance from center. 0 = linear. */
  readonly acceleration: number
  /** Clamp / map target rectangle for the virtual cursor. */
  readonly bounds: CursorBounds
  /** One Euro Filter parameters (applied in target space). */
  readonly oneEuro: OneEuroFilterConfig
  /** Flip X to match mirrored camera previews. */
  readonly mirrored: boolean
}

export type CursorInput = {
  readonly x: number
  readonly y: number
  readonly timestampMs: number
}

export type CursorEngine = {
  update: (input: CursorInput) => CursorPoint
  reset: () => void
  setConfig: (partial: Partial<CursorEngineConfig>) => void
  getConfig: () => CursorEngineConfig
  getPosition: () => CursorPoint | null
}

export type CreateCursorEngineOptions = Partial<CursorEngineConfig>
