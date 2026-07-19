import { useId, useState, type HTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/shared/lib'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export type TooltipProps = HTMLAttributes<HTMLSpanElement> & {
  content: ReactNode
  placement?: TooltipPlacement
  children: ReactNode
}

const placementClasses: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
}

export function Tooltip({
  content,
  placement = 'top',
  className,
  children,
  ...props
}: TooltipProps) {
  const tooltipId = useId()
  const [open, setOpen] = useState(false)

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...props}
    >
      <span aria-describedby={open ? tooltipId : undefined}>{children}</span>

      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          'bg-ink pointer-events-none absolute z-40 w-max max-w-xs rounded-md px-2.5 py-1.5',
          'text-ink-inverse font-sans text-xs font-medium shadow-md',
          'transition-opacity duration-150',
          placementClasses[placement],
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  )
}
