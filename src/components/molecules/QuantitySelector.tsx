import { IconButton } from '@/components/atoms/IconButton'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

/** Contador de cantidad con botones − y +, deshabilitados al llegar a los límites. */
export function QuantitySelector({ value, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  return (
    <div role="group" aria-label="Cantidad" className="inline-flex items-center rounded-lg border border-line bg-surface">
      <IconButton
        icon="minus"
        label="Disminuir cantidad"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      />
      <span data-testid="quantity-value" aria-live="polite" className="w-10 text-center font-semibold tabular-nums text-ink">
        {value}
      </span>
      <IconButton
        icon="plus"
        label="Aumentar cantidad"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      />
    </div>
  )
}
