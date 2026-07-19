import { useCallback, useEffect, useRef } from 'react'

import { useCameraService } from '../useCameraService'

/**
 * Returns a callback ref that binds/unbinds the active camera stream
 * without exposing MediaStream or MediaDevices to the caller.
 */
export function useCameraVideoRef() {
  const service = useCameraService()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      if (videoRef.current && videoRef.current !== node) {
        service.detachFromVideo(videoRef.current)
      }

      videoRef.current = node

      if (node) {
        service.attachToVideo(node)
      }
    },
    [service],
  )

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        service.detachFromVideo(videoRef.current)
        videoRef.current = null
      }
    }
  }, [service])

  return setVideoRef
}
