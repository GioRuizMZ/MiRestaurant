import { OrderLine } from '@/components/molecules/OrderLine'
import type { CartItem } from '@/types/product'

export interface OrderListProps {
  items: CartItem[]
  onIncrement: (id: number) => void
  onDecrement: (id: number) => void
  onRemove: (id: number) => void
}

/** Líneas del pedido. */
export function OrderList({ items, onIncrement, onDecrement, onRemove }: OrderListProps) {
  return (
    <ul aria-label="Líneas del pedido" className="divide-y divide-line rounded-card border border-line bg-surface px-4">
      {items.map((item) => (
        <li key={item.id}>
          <OrderLine
            item={item}
            onIncrement={() => onIncrement(item.id)}
            onDecrement={() => onDecrement(item.id)}
            onRemove={() => onRemove(item.id)}
          />
        </li>
      ))}
    </ul>
  )
}
