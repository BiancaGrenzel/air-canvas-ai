import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
} as const

export function Card({
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'border-border bg-surface rounded-lg border shadow-xs',
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  action,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn('mb-4 flex items-start justify-between gap-4', className)}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        {title ? (
          <h3 className="font-display text-ink text-base font-semibold">
            {title}
          </h3>
        ) : null}
        {description ? (
          <p className="text-ink-muted text-sm">{description}</p>
        ) : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function CardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-ink-secondary text-sm', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-border mt-4 flex items-center justify-end gap-2 border-t pt-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
