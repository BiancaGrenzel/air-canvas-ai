import { HandLandmarkIndex } from '@/domain'

import { clamp01, distance2d } from '../math'
import type {
  FeatureDetectorContext,
  GestureFeatureDetector,
  MutableGestureFeatures,
} from './feature-detector'

export type PinchDetectorOptions = {
  /** Normalized distance below which pinch activates. */
  activateBelow?: number
  /** Hysteresis: release above this distance (must be > activateBelow). */
  releaseAbove?: number
}

/**
 * True fist: all four fingers folded (including index).
 * Only used to block *starting* a pinch — never cancels mid-draw.
 */
function looksLikeClosedFist(
  landmarks: FeatureDetectorContext['hand']['landmarks'],
  handScale: number,
): boolean {
  const pairs: Array<[number, number]> = [
    [HandLandmarkIndex.INDEX_FINGER_MCP, HandLandmarkIndex.INDEX_FINGER_TIP],
    [HandLandmarkIndex.MIDDLE_FINGER_MCP, HandLandmarkIndex.MIDDLE_FINGER_TIP],
    [HandLandmarkIndex.RING_FINGER_MCP, HandLandmarkIndex.RING_FINGER_TIP],
    [HandLandmarkIndex.PINKY_MCP, HandLandmarkIndex.PINKY_TIP],
  ]

  let folded = 0
  for (const [mcpIndex, tipIndex] of pairs) {
    const mcp = landmarks[mcpIndex]
    const tip = landmarks[tipIndex]
    if (!mcp || !tip) continue
    if (distance2d(mcp, tip) < handScale * 0.55) folded += 1
  }

  return folded >= 4
}

export function createPinchDetector(
  options: PinchDetectorOptions = {},
): GestureFeatureDetector {
  const activateBelow = options.activateBelow ?? 0.12
  const releaseAbove = options.releaseAbove ?? 0.18

  return {
    id: 'pinch',
    detect(ctx: FeatureDetectorContext, draft: MutableGestureFeatures) {
      const thumb = ctx.hand.landmarks[HandLandmarkIndex.THUMB_TIP]
      const index = ctx.hand.landmarks[HandLandmarkIndex.INDEX_FINGER_TIP]
      const wrist = ctx.hand.landmarks[HandLandmarkIndex.WRIST]
      const middleMcp = ctx.hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_MCP]
      const wasActive = ctx.previous?.pinch.active ?? false

      // Brief landmark drop while pinching — keep previous pinch (no stroke chop).
      if (!thumb || !index || !wrist || !middleMcp) {
        if (wasActive && ctx.previous) {
          draft.pinch = { ...ctx.previous.pinch }
          return
        }
        draft.pinch = { active: false, distance: 1, strength: 0 }
        return
      }

      const handScale = Math.max(distance2d(wrist, middleMcp), 0.05)
      const distance = distance2d(thumb, index) / handScale

      if (!wasActive && looksLikeClosedFist(ctx.hand.landmarks, handScale)) {
        draft.pinch = { active: false, distance, strength: 0 }
        return
      }

      // Raw distance for both edges — snappy open/close. Hysteresis only.
      const active = wasActive
        ? distance <= releaseAbove
        : distance <= activateBelow

      const strength = clamp01(1 - distance / releaseAbove)

      draft.pinch = { active, distance, strength }
    },
  }
}
