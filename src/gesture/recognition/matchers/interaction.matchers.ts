import type { GestureMatcher } from './types'

function readString(
  params: Readonly<Record<string, unknown>> | undefined,
  key: string,
) {
  const value = params?.[key]
  return typeof value === 'string' ? value : null
}

function readNumber(
  params: Readonly<Record<string, unknown>> | undefined,
  key: string,
  fallback: number,
) {
  const value = params?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/**
 * Fires when the primary hand enters a target interaction state.
 * params: { state: InteractionState }
 */
export function createInteractionEnterMatcher(): GestureMatcher {
  return {
    type: 'interaction-enter',
    match(ctx, params) {
      const target = readString(params, 'state')
      const primary = ctx.primary
      if (!target || !primary) return null
      if (primary.state !== target) return null
      if (primary.previousState === target) return null

      return {
        confidence: Math.max(primary.features.confidence, 0.5),
        trackId: primary.trackId,
      }
    },
  }
}

/**
 * Fires while primary hand remains in a state.
 * params: { state: InteractionState, minConfidence?: number }
 */
export function createInteractionHoldMatcher(): GestureMatcher {
  return {
    type: 'interaction-hold',
    match(ctx, params) {
      const target = readString(params, 'state')
      const minConfidence = readNumber(params, 'minConfidence', 0)
      const primary = ctx.primary
      if (!target || !primary) return null
      if (primary.state !== target) return null
      if (primary.features.confidence < minConfidence) return null

      return {
        confidence: primary.features.confidence,
        trackId: primary.trackId,
      }
    },
  }
}

/**
 * Pinch tap: Released after Pinch with low travel (not a drag/draw).
 * params: { maxTravel?: number }
 */
export function createPinchTapMatcher(): GestureMatcher {
  return {
    type: 'pinch-tap',
    match(ctx, params) {
      const maxTravel = readNumber(params, 'maxTravel', 0.04)
      const primary = ctx.primary
      if (!primary) return null
      // Only the transition frame into Released (not lingering).
      if (!primary.changed) return null
      if (primary.state !== 'Released') return null
      if (primary.previousState !== 'Pinch') return null
      if (primary.features.pinchTravel > maxTravel) return null

      const confidence = Math.min(
        1,
        Math.max(
          0.4,
          primary.features.confidence *
            (1 - primary.features.pinchTravel / Math.max(maxTravel, 1e-6)),
        ),
      )

      return {
        confidence,
        trackId: primary.trackId,
      }
    },
  }
}
