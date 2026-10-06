import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Price } from '@/components/atoms/Price'
import { formatProductCount } from '@/lib/formatProductCount'

export interface OrderSummaryProps {
  count: number
  total: number
  onClear: () => void
}

/** Totales del pedido y "Vaciar pedido" con confirmación en línea (sin window.confirm). */
export function OrderSummary({ count, total, onClear }: OrderSummaryProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <aside aria-label="Resumen del pedido" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
      <p data-testid="summary-count" className="text-sm text-muted">
        {formatProductCount(count)}
      </p>
      <div className="flex items-baseline justify-between gap-3 border-t border-line pt-4">
        <span className="font-medium text-ink">Total</span>
        <span data-testid="summary-total">
          <Price value={total} className="text-2xl text-ink" />
        </span>
      </div>
      {confirming ? (
        <div role="alertdialog" aria-label="¿Vaciar el pedido?" className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink">¿Vaciar el pedido?</p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setConfirming(false)
                onClear()
              }}
            >
              Sí, vaciar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="danger" onClick={() => setConfirming(true)}>
          Vaciar pedido
        </Button>
      )}
    </aside>
  )
}
