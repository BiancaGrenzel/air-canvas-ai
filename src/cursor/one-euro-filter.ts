/**
 * One Euro Filter — Casiez, Roussel & Vogel (CHI 2012).
 * Low-pass filter that adapts cutoff frequency to signal speed.
 */
export type OneEuroFilterOptions = {
  minCutoff?: number
  beta?: number
  dCutoff?: number
}

export class OneEuroFilter1D {
  private readonly minCutoff: number
  private readonly beta: number
  private readonly dCutoff: number

  private initialized = false
  private previousTimestampSec: number | null = null
  private previousValue = 0
  private previousDerivative = 0

  constructor(options: OneEuroFilterOptions = {}) {
    this.minCutoff = options.minCutoff ?? 1.0
    this.beta = options.beta ?? 0.007
    this.dCutoff = options.dCutoff ?? 1.0
  }

  reset() {
    this.initialized = false
    this.previousTimestampSec = null
    this.previousValue = 0
    this.previousDerivative = 0
  }

  filter(value: number, timestampMs: number): number {
    const timestampSec = timestampMs / 1000

    if (!this.initialized || this.previousTimestampSec === null) {
      this.initialized = true
      this.previousTimestampSec = timestampSec
      this.previousValue = value
      this.previousDerivative = 0
      return value
    }

    const dt = timestampSec - this.previousTimestampSec
    if (dt <= 0) {
      return this.previousValue
    }

    const rawDerivative = (value - this.previousValue) / dt
    const derivative = exponentialSmoothing(
      rawDerivative,
      this.previousDerivative,
      alpha(dt, this.dCutoff),
    )

    const cutoff = this.minCutoff + this.beta * Math.abs(derivative)
    const filtered = exponentialSmoothing(
      value,
      this.previousValue,
      alpha(dt, cutoff),
    )

    this.previousTimestampSec = timestampSec
    this.previousValue = filtered
    this.previousDerivative = derivative

    return filtered
  }
}

export class OneEuroFilter2D {
  private readonly x: OneEuroFilter1D
  private readonly y: OneEuroFilter1D

  constructor(options: OneEuroFilterOptions = {}) {
    this.x = new OneEuroFilter1D(options)
    this.y = new OneEuroFilter1D(options)
  }

  reset() {
    this.x.reset()
    this.y.reset()
  }

  filter(
    point: { x: number; y: number },
    timestampMs: number,
  ): { x: number; y: number } {
    return {
      x: this.x.filter(point.x, timestampMs),
      y: this.y.filter(point.y, timestampMs),
    }
  }
}

function alpha(dt: number, cutoff: number): number {
  const tau = 1 / (2 * Math.PI * Math.max(cutoff, 1e-6))
  return 1 / (1 + tau / Math.max(dt, 1e-6))
}

function exponentialSmoothing(
  value: number,
  previous: number,
  a: number,
): number {
  return a * value + (1 - a) * previous
}

/** Exposed for unit tests. */
export const oneEuroInternals = {
  alpha,
  exponentialSmoothing,
}
