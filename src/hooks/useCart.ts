import { useMemo } from 'react'
import { useCartStore } from '@/store/cartStore'

/** Total de unidades del carrito. Solo vuelve a renderizar cuando cambia el número. */
export function useCartCount(): number {
  return useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0))
}

export function useCart() {
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const increment = useCartStore((state) => state.increment)
  const decrement = useCartStore((state) => state.decrement)
  const removeItem = useCartStore((state) => state.removeItem)
  const clear = useCartStore((state) => state.clear)

  const totals = useMemo(
    () => ({
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    [items],
  )

  return { items, ...totals, addItem, increment, decrement, removeItem, clear }
}
