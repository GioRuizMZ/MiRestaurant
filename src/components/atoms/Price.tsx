import { cx } from '@/lib/cx'
import { formatPrice } from '@/lib/formatPrice'

interface PriceProps {
  value: number
  className?: string
}

export function Price({ value, className }: PriceProps) {
  return <span className={cx('font-semibold tabular-nums', className)}>{formatPrice(value)}</span>
}
