import type { ButtonHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-700 focus-visible:outline-primary',
  secondary:
    'border border-line bg-surface text-ink hover:border-primary hover:bg-primary hover:text-white focus-visible:outline-primary',
  ghost: 'text-ink hover:bg-primary-50 focus-visible:outline-primary',
  danger: 'border border-danger/30 bg-surface text-danger hover:bg-danger/5 focus-visible:outline-danger',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
