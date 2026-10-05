import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white',
        className,
      )}
    >
      {children}
    </span>
  )
}
