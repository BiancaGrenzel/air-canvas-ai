export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function sign(value: number): number {
  if (value > 0) return 1
  if (value < 0) return -1
  return 0
}
