import { useMemo } from 'react'
import { useCartStore } from '@/store/cartStore'

/**
 * Resumen del pedido para el encabezado: total de unidades y monto total.
 * Dos selectores de valores primitivos: solo vuelve a renderizar cuando cambia alguno de los dos números.
 */
export function useOrderSummary(): { count: number; total: number } {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
  const total = useCartStore((state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  return { count, total }
}

/** Solo la acción de agregar: no vuelve a renderizar cuando cambia el contenido del carrito. */
export function useAddToCart() {
  return useCartStore((state) => state.addItem)
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
