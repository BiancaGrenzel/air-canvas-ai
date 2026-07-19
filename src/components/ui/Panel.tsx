import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib'

export type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  tone?: 'default' | 'muted' | 'accent'
}

const toneClasses = {
  default: 'border-border bg-surface',
  muted: 'border-border bg-surface-muted',
  accent: 'border-accent/20 bg-accent-muted/60',
} as const

export function Panel({
  title,
  description,
  action,
  tone = 'default',
  className,
  children,
  ...props
}: PanelProps) {
  const hasHeader = Boolean(title || description || action)

  return (
    <section
      className={cn(
        'rounded-lg border shadow-xs',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {hasHeader ? (
        <header className="border-border flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h3 className="font-display text-ink text-sm font-semibold">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="text-ink-muted text-sm">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  )
}
