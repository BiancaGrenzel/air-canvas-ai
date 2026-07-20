import { HandLandmarkIndex, type HandPose, type Landmark } from '@/domain'

import { distance2d } from '../../math'
import type { GestureMatcher } from './types'

function fingerExtended(mcp: Landmark, pip: Landmark, tip: Landmark): boolean {
  return distance2d(mcp, tip) > distance2d(mcp, pip) * 1.12
}

function fingerFolded(mcp: Landmark, tip: Landmark, scale: number): boolean {
  return distance2d(mcp, tip) < scale * 0.6
}

function handScale(hand: HandPose): number {
  const wrist = hand.landmarks[HandLandmarkIndex.WRIST]
  const middle = hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_MCP]
  if (!wrist || !middle) return 0.2
  return Math.max(distance2d(wrist, middle), 0.05)
}

function rawOpenPalmScore(hand: HandPose): number {
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
    if (distance2d(palm, tip) > scale * 0.8) open += 1
  }
  return open / tips.length
}

function rawFistScore(hand: HandPose): number {
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

function rawVictoryScore(hand: HandPose): number {
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
  const tipSpread = distance2d(indexTip, middleTip) > scale * 0.3

  if (!indexUp || !middleUp || !ringDown || !pinkyDown || !tipSpread) {
    return 0
  }

  return 1
}

/**
 * Rock / horns 🤘 — index + pinky up, middle + ring folded.
 * Rejects pinch-release frames (thumb still near index) which look like a
 * half-open draw hand after an upward stroke.
 */
function rawRockScore(hand: HandPose): number {
  const thumbTip = hand.landmarks[HandLandmarkIndex.THUMB_TIP]
  const indexMcp = hand.landmarks[HandLandmarkIndex.INDEX_FINGER_MCP]
  const indexPip = hand.landmarks[HandLandmarkIndex.INDEX_FINGER_PIP]
  const indexTip = hand.landmarks[HandLandmarkIndex.INDEX_FINGER_TIP]
  const middleMcp = hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_MCP]
  const middleTip = hand.landmarks[HandLandmarkIndex.MIDDLE_FINGER_TIP]
  const ringMcp = hand.landmarks[HandLandmarkIndex.RING_FINGER_MCP]
  const ringTip = hand.landmarks[HandLandmarkIndex.RING_FINGER_TIP]
  const pinkyMcp = hand.landmarks[HandLandmarkIndex.PINKY_MCP]
  const pinkyPip = hand.landmarks[HandLandmarkIndex.PINKY_PIP]
  const pinkyTip = hand.landmarks[HandLandmarkIndex.PINKY_TIP]

  if (
    !thumbTip ||
    !indexMcp ||
    !indexPip ||
    !indexTip ||
    !middleMcp ||
    !middleTip ||
    !ringMcp ||
    !ringTip ||
    !pinkyMcp ||
    !pinkyPip ||
    !pinkyTip
  ) {
    return 0
  }

  const scale = handScale(hand)

  // Still parting a pinch — not a deliberate rock pose.
  if (distance2d(thumbTip, indexTip) < scale * 0.55) {
    return 0
  }

  const indexUp = fingerExtended(indexMcp, indexPip, indexTip)
  const pinkyUp = fingerExtended(pinkyMcp, pinkyPip, pinkyTip)
  const middleDown = fingerFolded(middleMcp, middleTip, scale)
  const ringDown = fingerFolded(ringMcp, ringTip, scale)
  const hornSpread = distance2d(indexTip, pinkyTip) > scale * 0.5

  if (!indexUp || !pinkyUp || !middleDown || !ringDown || !hornSpread) {
    return 0
  }

  return 1
}

/**
 * Soft mutual exclusion — prefer the clearer pose without zeroing borderline frames.
 */
function scoreOpenPalm(hand: HandPose): number {
  const open = rawOpenPalmScore(hand)
  const fist = rawFistScore(hand)
  if (fist >= open) return open * 0.35
  return open
}

function scoreFist(hand: HandPose): number {
  const fist = rawFistScore(hand)
  const open = rawOpenPalmScore(hand)
  if (open >= fist) return fist * 0.35
  return fist
}

function scoreVictory(hand: HandPose): number {
  const victory = rawVictoryScore(hand)
  if (victory <= 0) return 0
  if (rawRockScore(hand) > 0) return 0
  const open = rawOpenPalmScore(hand)
  const fist = rawFistScore(hand)
  if (open > 0.7 || fist > 0.7) return 0
  return victory
}

function scoreRock(hand: HandPose): number {
  const rock = rawRockScore(hand)
  if (rock <= 0) return 0
  if (rawVictoryScore(hand) > 0) return 0
  const fist = rawFistScore(hand)
  if (fist > 0.7) return 0
  return rock
}

function bestHandScore(
  hands: readonly HandPose[],
  scoreOf: (hand: HandPose) => number,
  primaryTrackId: string | null,
  minScore: number,
  minHandConfidence: number,
): { confidence: number; trackId: string | null } | null {
  let best = 0
  let trackId: string | null = primaryTrackId

  hands.forEach((hand, index) => {
    if (hand.confidence < minHandConfidence) return
    const score = scoreOf(hand)
    if (score > best) {
      best = score
      trackId = `${hand.handedness}-${index}`
    }
  })

  if (best < minScore) return null
  return { confidence: best, trackId }
}

/**
 * Landmark-based open palm matcher (available for custom definitions).
 * params: { minScore?: number }
 */
export function createOpenPalmMatcher(): GestureMatcher {
  return {
    type: 'landmark-open-palm',
    match(ctx, params) {
      const minScore =
        typeof params?.minScore === 'number' ? params.minScore : 0.7
      return bestHandScore(
        ctx.hands,
        scoreOpenPalm,
        ctx.primary?.trackId ?? null,
        minScore,
        0.45,
      )
    },
  }
}

/**
 * Landmark-based rock / horns matcher (clear canvas).
 */
export function createRockMatcher(): GestureMatcher {
  return {
    type: 'landmark-rock',
    match(ctx, params) {
      const minScore =
        typeof params?.minScore === 'number' ? params.minScore : 0.85
      return bestHandScore(
        ctx.hands,
        scoreRock,
        ctx.primary?.trackId ?? null,
        minScore,
        0.5,
      )
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
        typeof params?.minScore === 'number' ? params.minScore : 0.7
      return bestHandScore(
        ctx.hands,
        scoreFist,
        ctx.primary?.trackId ?? null,
        minScore,
        0.45,
      )
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
        typeof params?.minScore === 'number' ? params.minScore : 0.85
      return bestHandScore(
        ctx.hands,
        scoreVictory,
        ctx.primary?.trackId ?? null,
        minScore,
        0.5,
      )
    },
  }
}
