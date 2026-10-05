import { cx } from '@/lib/cx'

export function Spinner({ label = 'Cargando', className }: { label?: string; className?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cx('inline-block size-5 animate-spin rounded-full border-2 border-line border-t-primary', className)}
    />
  )
}
