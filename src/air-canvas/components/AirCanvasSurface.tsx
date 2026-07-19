import { useEffect, useRef } from 'react'

import { cn } from '@/shared/lib'

import type { AirCanvasEngine } from '../types'

export type AirCanvasSurfaceProps = {
  engine: AirCanvasEngine
  className?: string
}

/**
 * Presentation shell: mounts a canvas and attaches the React-free engine.
 */
export function AirCanvasSurface({ engine, className }: AirCanvasSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return

    engine.attach(canvas)

    const sync = () => {
      const { width, height } = host.getBoundingClientRect()
      engine.setSize(width, height)
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(host)

    return () => {
      observer.disconnect()
      engine.detach()
    }
  }, [engine])

  return (
    <div ref={hostRef} className={cn('relative h-full w-full', className)}>
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
    </div>
  )
}
