/**
 * Canvas drawing surface actions — host-agnostic.
 * AirCanvas (web) or a future native surface can implement this.
 */
export interface CanvasActionPort {
  setColor: (color: string) => void
  getColor: () => string
  clear: () => void
  saveImage: (filename?: string) => void | Promise<void>
}
