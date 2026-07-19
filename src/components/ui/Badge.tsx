import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib'

export type BadgeVariant =
  'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'outline'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  leftIcon?: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-canvas-subtle text-ink-secondary',
  accent: 'bg-accent-muted text-accent',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  outline: 'border border-border bg-surface text-ink-secondary',
}

export function Badge({
  variant = 'neutral',
  leftIcon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium tracking-wide',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {leftIcon ? (
        <span className="inline-flex shrink-0">{leftIcon}</span>
      ) : null}
      {children}
    </span>
  )
}
