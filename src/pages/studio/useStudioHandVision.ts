import { useEffect, useRef, useState, type RefObject } from 'react'

import {
  createHandVision,
  type HandVision,
  type HandVisionResults,
} from '@/vision'

/**
 * Presentation bridge: connects a video element to the React-free vision module.
 * All AI logic stays inside `@/vision` via start / stop / onResults.
 */
export function useStudioHandVision(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  const visionRef = useRef<HandVision | null>(null)
  const [results, setResults] = useState<HandVisionResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const vision = createHandVision({
      frameProvider: {
        getFrame: () => videoRef.current,
      },
      onError: (err) => {
        setError(err.message)
        setStarted(false)
      },
    })

    const unsubscribe = vision.onResults((next) => {
      setResults(next)
      setError(null)
    })

    visionRef.current = vision

    return () => {
      unsubscribe()
      vision.stop()
      visionRef.current = null
    }
  }, [videoRef])

  useEffect(() => {
    const vision = visionRef.current
    if (!vision) return

    if (!enabled) {
      vision.stop()
      return
    }

    let cancelled = false

    void vision
      .start()
      .then(() => {
        if (!cancelled) setStarted(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setStarted(false)
        setError(err instanceof Error ? err.message : 'Failed to start vision')
      })

    return () => {
      cancelled = true
      vision.stop()
    }
  }, [enabled])

  const activeResults = enabled ? results : null

  return {
    results: activeResults,
    error: enabled ? error : null,
    running: enabled && started && !error,
    hands: activeResults?.hands ?? [],
  }
}
