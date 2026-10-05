import type { InputHTMLAttributes, Ref } from 'react'
import { cx } from '@/lib/cx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>
}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cx(
        'h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted',
        'focus:border-primary focus:outline-2 focus:outline-primary-200',
        className,
      )}
      {...props}
    />
  )
}
