import { useEffect, useRef } from 'react'

import { cn } from '@/shared/lib'

import { createHandCanvasRenderer } from '../create-hand-canvas-renderer'
import type {
  CreateHandCanvasRendererOptions,
  DrawHand,
  HandCanvasRenderer,
} from '../types'

export type HandSkeletonOverlayProps = {
  hands: readonly DrawHand[]
  mirrored?: boolean
  className?: string
  styleOptions?: CreateHandCanvasRendererOptions['style']
}

/**
 * Presentation shell around the pure Canvas renderer.
 * No AI — only forwards landmark data into `draw()`.
 */
export function HandSkeletonOverlay({
  hands,
  mirrored = true,
  className,
  styleOptions,
}: HandSkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<HandCanvasRenderer | null>(null)
  const frameRef = useRef({ hands, mirrored })

  useEffect(() => {
    frameRef.current = { hands, mirrored }
  }, [hands, mirrored])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = containerRef.current
    if (!canvas || !host) return

    const renderer = createHandCanvasRenderer(canvas, { style: styleOptions })
    rendererRef.current = renderer

    const paint = () => {
      const { width, height } = host.getBoundingClientRect()
      renderer.setSize(width, height)
      renderer.draw(frameRef.current)
    }

    paint()

    const observer = new ResizeObserver(paint)
    observer.observe(host)

    return () => {
      observer.disconnect()
      renderer.clear()
      rendererRef.current = null
    }
  }, [styleOptions])

  useEffect(() => {
    const renderer = rendererRef.current
    const host = containerRef.current
    if (!renderer || !host) return

    const { width, height } = host.getBoundingClientRect()
    renderer.setSize(width, height)
    renderer.draw({ hands, mirrored })
  }, [hands, mirrored])

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
