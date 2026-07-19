/**
 * Minimal landmark payload for the drawing layer.
 * Intentionally decoupled from vision / MediaPipe types.
 */
export type DrawLandmark = {
  readonly x: number
  readonly y: number
  readonly z?: number
}

export type DrawHand = {
  readonly handedness: string
  readonly confidence: number
  readonly landmarks: readonly DrawLandmark[]
}

export type DrawHandsFrame = {
  readonly hands: readonly DrawHand[]
  /** Flip X to match mirrored camera previews. */
  readonly mirrored?: boolean
}

export type HandCanvasStyle = {
  leftBoneColor: string
  rightBoneColor: string
  unknownBoneColor: string
  leftJointColor: string
  rightJointColor: string
  unknownJointColor: string
  boneWidth: number
  jointRadius: number
  fingertipRadius: number
  wristRadius: number
  indicatorBackground: string
  indicatorText: string
  indicatorPaddingX: number
  indicatorPaddingY: number
  indicatorFont: string
  showBones: boolean
  showJoints: boolean
  showIndicators: boolean
  showFingertipMarkers: boolean
}

export type HandCanvasRenderer = {
  draw: (frame: DrawHandsFrame) => void
  clear: () => void
  setSize: (cssWidth: number, cssHeight: number) => void
  getContext: () => CanvasRenderingContext2D
}

export type CreateHandCanvasRendererOptions = {
  style?: Partial<HandCanvasStyle>
  /** Device pixel ratio override (defaults to window.devicePixelRatio). */
  pixelRatio?: number
}
