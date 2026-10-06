import { IconButton } from '@/components/atoms/IconButton'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  /** Nombre del producto, para que los botones de cada línea tengan un nombre accesible único. */
  itemLabel?: string
}

/** Contador de cantidad con botones − y +, deshabilitados al llegar a los límites. */
export function QuantitySelector({ value, onChange, min = 1, max = 99, itemLabel }: QuantitySelectorProps) {
  const suffix = itemLabel ? ` de ${itemLabel}` : ''

  return (
    <div
      role="group"
      aria-label={`Cantidad${suffix}`}
      className="inline-flex items-center rounded-lg border border-line bg-surface"
    >
      <IconButton
        icon="minus"
        label={`Disminuir cantidad${suffix}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      />
      <span data-testid="quantity-value" aria-live="polite" className="w-10 text-center font-semibold tabular-nums text-ink">
        {value}
      </span>
      <IconButton
        icon="plus"
        label={`Aumentar cantidad${suffix}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      />
    </div>
  )
}
