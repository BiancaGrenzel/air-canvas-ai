import { cn } from '@/shared/lib'

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-foreground shadow-xs hover:bg-accent-hover active:bg-accent-hover',
  secondary:
    'bg-ink text-ink-inverse shadow-xs hover:bg-ink-secondary active:bg-ink-secondary',
  outline:
    'border border-border bg-surface text-ink shadow-xs hover:bg-surface-muted hover:border-border-strong',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-canvas-subtle hover:text-ink',
  danger:
    'bg-danger text-ink-inverse shadow-xs hover:bg-danger-hover active:bg-danger-hover',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-9 gap-2 px-3.5 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
}

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
} = {}) {
  return cn(
    'inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors duration-150',
    'disabled:pointer-events-none disabled:opacity-45',
    'focus-visible:outline-none focus-visible:shadow-focus',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  )
}
