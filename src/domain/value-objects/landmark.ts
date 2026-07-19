export type Landmark = {
  readonly x: number
  readonly y: number
  readonly z: number
}

export const HAND_LANDMARK_COUNT = 21 as const

export function createLandmark(x: number, y: number, z: number): Landmark {
  return { x, y, z }
}
