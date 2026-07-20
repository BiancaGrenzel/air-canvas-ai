import {
  createFistMatcher,
  createOpenPalmMatcher,
  createRockMatcher,
  createVictoryMatcher,
} from './landmark.matchers'
import {
  createInteractionEnterMatcher,
  createInteractionHoldMatcher,
  createPinchTapMatcher,
} from './interaction.matchers'
import { createGestureMatcherRegistry } from './matcher-registry'
import type { GestureMatcher } from './types'

export type {
  GestureMatchScore,
  GestureMatcher,
  GestureMatcherRegistry,
  GestureRecognitionContext,
} from './types'

export { createGestureMatcherRegistry } from './matcher-registry'
export {
  createInteractionEnterMatcher,
  createInteractionHoldMatcher,
  createPinchTapMatcher,
} from './interaction.matchers'
export {
  createFistMatcher,
  createOpenPalmMatcher,
  createRockMatcher,
  createVictoryMatcher,
} from './landmark.matchers'

export function createDefaultGestureMatchers(): GestureMatcher[] {
  return [
    createInteractionEnterMatcher(),
    createInteractionHoldMatcher(),
    createPinchTapMatcher(),
    createRockMatcher(),
    createOpenPalmMatcher(),
    createFistMatcher(),
    createVictoryMatcher(),
  ]
}

export function createDefaultMatcherRegistry() {
  return createGestureMatcherRegistry(createDefaultGestureMatchers())
}
