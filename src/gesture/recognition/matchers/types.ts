import type {
  GestureFeatures,
  HandInteractionSnapshot,
  HandPose,
  InteractionSnapshot,
} from '@/domain'

export type GestureMatchScore = {
  readonly confidence: number
  readonly trackId: string | null
}

export type GestureRecognitionContext = {
  readonly timestampMs: number
  readonly snapshot: InteractionSnapshot
  readonly primary: HandInteractionSnapshot | null
  readonly features: GestureFeatures | null
  /** Raw poses when available (landmark-based matchers). */
  readonly hands: readonly HandPose[]
}

/**
 * Strategy: evaluate whether a gesture is active for the current frame.
 * Registered by `type` — definitions only reference the type + params.
 */
export interface GestureMatcher {
  readonly type: string
  match(
    ctx: GestureRecognitionContext,
    params?: Readonly<Record<string, unknown>>,
  ): GestureMatchScore | null
}

export type GestureMatcherRegistry = {
  register: (matcher: GestureMatcher) => void
  unregister: (type: string) => void
  get: (type: string) => GestureMatcher | undefined
  listTypes: () => readonly string[]
}
