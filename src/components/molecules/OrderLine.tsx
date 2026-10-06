import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Image } from '@/components/atoms/Image'
import { Price } from '@/components/atoms/Price'
import { QuantitySelector } from '@/components/molecules/QuantitySelector'
import type { CartItem } from '@/types/product'

export interface OrderLineProps {
  item: CartItem
  onIncrement: () => void
  /** Desde 1, quita la línea. */
  onDecrement: () => void
  onRemove: () => void
}

/** Línea del pedido: imagen, nombre, precio unitario, cantidad, subtotal y "Quitar". */
export function OrderLine({ item, onIncrement, onDecrement, onRemove }: OrderLineProps) {
  return (
    <article aria-label={item.name} className="flex gap-4 py-4">
      <Image src={item.image} alt="" className="size-16 shrink-0 rounded-lg border border-line bg-surface" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-medium text-ink">{item.name}</h2>
            <p className="text-sm text-muted">
              <Price value={item.price} className="font-normal" /> c/u
            </p>
          </div>
          <p data-testid="line-subtotal">
            <Price value={item.price * item.quantity} className="text-ink" />
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <QuantitySelector
            value={item.quantity}
            min={0}
            itemLabel={item.name}
            onChange={(next) => (next > item.quantity ? onIncrement() : onDecrement())}
          />
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Quitar ${item.name}`}>
            <Icon name="trash" className="size-4" />
            Quitar
          </Button>
        </div>
      </div>
    </article>
  )
}
