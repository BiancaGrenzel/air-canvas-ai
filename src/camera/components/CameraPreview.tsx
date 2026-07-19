import { useCallback, type Ref, type VideoHTMLAttributes } from 'react'

import { cn } from '@/shared/lib'

import { useCameraVideoRef } from '../hooks/useCameraVideoRef'

export type CameraPreviewProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  'src' | 'srcObject' | 'autoPlay' | 'muted' | 'playsInline'
> & {
  mirrored?: boolean
  ref?: Ref<HTMLVideoElement>
}

/**
 * Renders the active camera feed. Binding happens exclusively through
 * the camera module — no MediaDevices / MediaStream access in screens.
 */
export function CameraPreview({
  className,
  mirrored = true,
  ref,
  ...props
}: CameraPreviewProps) {
  const attachStream = useCameraVideoRef()

  const setRefs = useCallback(
    (node: HTMLVideoElement | null) => {
      attachStream(node)
      assignRef(ref, node)
    },
    [attachStream, ref],
  )

  return (
    <video
      ref={setRefs}
      className={cn(
        'bg-ink h-full w-full object-cover',
        mirrored && '-scale-x-100',
        className,
      )}
      {...props}
    />
  )
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  ;(ref as { current: T | null }).current = value
}
