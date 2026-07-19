import { colors } from '@/shared/config'

import type { HandCanvasStyle } from './types'

export const DEFAULT_HAND_CANVAS_STYLE: HandCanvasStyle = {
  leftBoneColor: colors.accent,
  rightBoneColor: colors.success,
  unknownBoneColor: colors.inkMuted,
  leftJointColor: colors.accentHover,
  rightJointColor: '#15803d',
  unknownJointColor: colors.inkSecondary,
  boneWidth: 3,
  jointRadius: 3.5,
  fingertipRadius: 5,
  wristRadius: 6,
  indicatorBackground: 'rgb(9 9 11 / 72%)',
  indicatorText: colors.inkInverse,
  indicatorPaddingX: 8,
  indicatorPaddingY: 5,
  indicatorFont:
    '600 11px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  showBones: true,
  showJoints: true,
  showIndicators: true,
  showFingertipMarkers: true,
}

export function resolveHandCanvasStyle(
  partial?: Partial<HandCanvasStyle>,
): HandCanvasStyle {
  return {
    ...DEFAULT_HAND_CANVAS_STYLE,
    ...partial,
  }
}
