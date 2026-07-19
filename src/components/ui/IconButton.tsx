import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib'

import type { ButtonSize, ButtonVariant } from './buttonVariants'
import { buttonVariants } from './buttonVariants'

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  variant?: ButtonVariant
  size?: ButtonSize
  label: string
  children: ReactNode
}

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        buttonVariants({ variant, size }),
        iconSizeClasses[size],
        'shrink-0 p-0',
        className,
      )}
      {...props}
    >
      <span className="inline-flex size-4 items-center justify-center [&>svg]:size-4">
        {children}
      </span>
    </button>
  )
}
