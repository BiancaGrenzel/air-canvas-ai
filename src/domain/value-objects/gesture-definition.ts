/**
 * Declarative gesture definition — serializable for future user-authored gestures.
 */
export type GestureMatcherRef = {
  readonly type: string
  readonly params?: Readonly<Record<string, unknown>>
}

export type GestureDefinition = {
  readonly id: string
  readonly name: string
  readonly description: string
  /** Minimum confidence [0–1] required to trigger. */
  readonly confidence: number
  /** Action id resolved by the Command registry. */
  readonly action: string
  readonly matcher: GestureMatcherRef
  readonly cooldownMs?: number
  readonly enabled?: boolean
}

export type GestureMatch = {
  readonly definition: GestureDefinition
  readonly confidence: number
  readonly timestampMs: number
  readonly trackId: string | null
}

export function createGestureDefinition(
  input: GestureDefinition,
): GestureDefinition {
  return {
    ...input,
    confidence: clamp01(input.confidence),
    enabled: input.enabled ?? true,
    cooldownMs: input.cooldownMs ?? 800,
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(1, Math.max(0, value))
}
