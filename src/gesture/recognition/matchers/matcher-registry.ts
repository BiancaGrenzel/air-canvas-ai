import type { GestureMatcher, GestureMatcherRegistry } from './types'

export function createGestureMatcherRegistry(
  initial: readonly GestureMatcher[] = [],
): GestureMatcherRegistry {
  const matchers = new Map<string, GestureMatcher>()

  for (const matcher of initial) {
    matchers.set(matcher.type, matcher)
  }

  return {
    register(matcher) {
      matchers.set(matcher.type, matcher)
    },
    unregister(type) {
      matchers.delete(type)
    },
    get(type) {
      return matchers.get(type)
    },
    listTypes() {
      return [...matchers.keys()]
    },
  }
}
