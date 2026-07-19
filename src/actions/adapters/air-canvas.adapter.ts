import type { CanvasActionPort } from '@/application/ports'
import type { AirCanvasEngine } from '@/air-canvas'

/**
 * Adapts AirCanvasEngine to the CanvasActionPort used by Action Engine.
 */
export function createAirCanvasActionAdapter(
  getEngine: () => AirCanvasEngine,
): CanvasActionPort {
  return {
    setColor(color) {
      getEngine().setColor(color)
    },
    getColor() {
      return getEngine().getSettings().color
    },
    clear() {
      getEngine().clear()
    },
    saveImage(filename) {
      getEngine().downloadPng(filename)
    },
  }
}
