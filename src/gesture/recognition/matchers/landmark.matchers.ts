import { HandLandmarkIndex, type HandPose, type Landmark } from '@/domain'

import { distance2d } from '../../math'
import type { GestureMatcher } from './types'

function fingerExtended(mcp: Landmark, pip: Landmark, tip: Landmark): boolean {
  // Tip farther from wrist-ish MCP than PIP is a simple extension proxy.
  return distance2d(mcp, tip) > distance2d(mcp, pip) * 1.15
}

function fingerFolded(mcp: Landmark, tip: Landmark, scale: number): boolean {
  return distance2d(mcp, tip) < scale * 0.55
}

function handScale(hand: HandPose): number {
  const wrist = hand.landmarks[HandLandmarkIndex.WRIST]
  const middle = hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_MCP]
  if (!wrist || !middle) return 0.2
  return Math.max(distance2d(wrist, middle), 0.05)
}

function scoreOpenPalm(hand: HandPose): number {
  const scale = handScale(hand)
  const tips = [
    HandLandmarkIndex.THUMB_TIP,
    HandLandmarkIndex.INDEX_FINGER_TIP,
    HandLandmarkIndex.MIDDLE_FINGER_TIP,
    HandLandmarkIndex.RING_FINGER_TIP,
    HandLandmarkIndex.PINKY_TIP,
  ]
  const palm = hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_MCP]
  if (!palm) return 0

  let open = 0
  for (const tipIndex of tips) {
    const tip = hand.landmarks[tipIndex]
    if (!tip) continue
    if (distance2d(palm, tip) > scale * 0.85) open += 1
  }
  return open / tips.length
}

function scoreFist(hand: HandPose): number {
  const scale = handScale(hand)
  const pairs: Array<[number, number]> = [
    [HandLandmarkIndex.INDEX_FINGER_MCP, HandLandmarkIndex.INDEX_FINGER_TIP],
    [HandLandmarkIndex.MIDDLE_FINGER_MCP, HandLandmarkIndex.MIDDLE_FINGER_TIP],
    [HandLandmarkIndex.RING_FINGER_MCP, HandLandmarkIndex.RING_FINGER_TIP],
    [HandLandmarkIndex.PINKY_MCP, HandLandmarkIndex.PINKY_TIP],
  ]

  let folded = 0
  for (const [mcpIndex, tipIndex] of pairs) {
    const mcp = hand.landmarks[mcpIndex]
    const tip = hand.landmarks[tipIndex]
    if (!mcp || !tip) continue
    if (fingerFolded(mcp, tip, scale)) folded += 1
  }
  return folded / pairs.length
}

function scoreVictory(hand: HandPose): number {
  const indexMcp = hand.landmarks[HandLandmarkIndex.INDEX_FINGER_MCP]
  const indexPip = hand.landmarks[HandLandmarkIndex.INDEX_FINGER_PIP]
  const indexTip = hand.landmarks[HandLandmarkIndex.INDEX_FINGER_TIP]
  const middleMcp = hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_MCP]
  const middlePip = hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_PIP]
  const middleTip = hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_TIP]
  const ringMcp = hand.landmarks[HandLandmarkIndex.RING_FINGER_MCP]
  const ringTip = hand.landmarks[HandLandmarkIndex.RING_FINGER_TIP]
  const pinkyMcp = hand.landmarks[HandLandmarkIndex.PINKY_MCP]
  const pinkyTip = hand.landmarks[HandLandmarkIndex.PINKY_TIP]

  if (
    !indexMcp ||
    !indexPip ||
    !indexTip ||
    !middleMcp ||
    !middlePip ||
    !middleTip ||
    !ringMcp ||
    !ringTip ||
    !pinkyMcp ||
    !pinkyTip
  ) {
    return 0
  }

  const scale = handScale(hand)
  const indexUp = fingerExtended(indexMcp, indexPip, indexTip)
  const middleUp = fingerExtended(middleMcp, middlePip, middleTip)
  const ringDown = fingerFolded(ringMcp, ringTip, scale)
  const pinkyDown = fingerFolded(pinkyMcp, pinkyTip, scale)

  const bits = [indexUp, middleUp, ringDown, pinkyDown]
  return bits.filter(Boolean).length / bits.length
}

/**
 * Landmark-based open palm matcher.
 * params: { minScore?: number }
 */
export function createOpenPalmMatcher(): GestureMatcher {
  return {
    type: 'landmark-open-palm',
    match(ctx, params) {
      const minScore =
        typeof params?.minScore === 'number' ? params.minScore : 0.75
      let best = 0
      let trackId: string | null = ctx.primary?.trackId ?? null

      ctx.hands.forEach((hand, index) => {
        const score = scoreOpenPalm(hand) * hand.confidence
        if (score > best) {
          best = score
          trackId = `${hand.handedness}-${index}`
        }
      })

      if (best < minScore) return null
      return { confidence: best, trackId }
    },
  }
}

/**
 * Landmark-based fist matcher.
 */
export function createFistMatcher(): GestureMatcher {
  return {
    type: 'landmark-fist',
    match(ctx, params) {
      const minScore =
        typeof params?.minScore === 'number' ? params.minScore : 0.75
      let best = 0
      let trackId: string | null = ctx.primary?.trackId ?? null

      ctx.hands.forEach((hand, index) => {
        const score = scoreFist(hand) * hand.confidence
        if (score > best) {
          best = score
          trackId = `${hand.handedness}-${index}`
        }
      })

      if (best < minScore) return null
      return { confidence: best, trackId }
    },
  }
}

/**
 * Landmark-based victory (peace) matcher.
 */
export function createVictoryMatcher(): GestureMatcher {
  return {
    type: 'landmark-victory',
    match(ctx, params) {
      const minScore =
        typeof params?.minScore === 'number' ? params.minScore : 0.75
      let best = 0
      let trackId: string | null = ctx.primary?.trackId ?? null

      ctx.hands.forEach((hand, index) => {
        const score = scoreVictory(hand) * hand.confidence
        if (score > best) {
          best = score
          trackId = `${hand.handedness}-${index}`
        }
      })

      if (best < minScore) return null
      return { confidence: best, trackId }
    },
  }
}
