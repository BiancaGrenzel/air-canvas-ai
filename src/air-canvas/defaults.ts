import { colors } from '@/shared/config'

import type { AirCanvasSettings } from './types'

export const DEFAULT_AIR_CANVAS_SETTINGS: AirCanvasSettings = {
  tool: 'brush',
  color: colors.ink,
  thickness: 4,
  background: colors.surface,
}

export const AIR_CANVAS_COLOR_PRESETS = [
  colors.ink,
  colors.accent,
  colors.danger,
  colors.success,
  '#f59e0b',
  '#ffffff',
] as const
