import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types/product'

export const CART_STORAGE_KEY = 'mirestaurant-cart'

export type CartProduct = Pick<Product, 'id' | 'name' | 'price' | 'sku'>

interface CartState {
  items: CartItem[]
  /** Agrega `quantity` unidades. Si el producto ya está, suma a su línea existente. */
  addItem: (product: CartProduct, quantity?: number) => void
  increment: (id: number) => void
  /** Resta una unidad. Si la línea tenía 1, la quita. */
  decrement: (id: number) => void
  removeItem: (id: number) => void
  clear: () => void
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.sku === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  )
}

/** Descarta datos persistidos con forma inválida para arrancar sin errores. */
export function sanitizeItems(value: unknown): CartItem[] {
  return Array.isArray(value) ? value.filter(isCartItem) : []
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const amount = Math.max(1, Math.floor(quantity))
          const existing = state.items.find((item) => item.id === product.id)
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + amount } : item,
              ),
            }
          }
          const { id, name, sku, price } = product
          return { items: [...state.items, { id, name, sku, price, quantity: amount }] }
        }),
      increment: (id) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
        })),
      decrement: (id) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      migrate: (persisted) => ({ items: sanitizeItems((persisted as { items?: unknown } | null)?.items) }),
      merge: (persisted, current) => ({
        ...current,
        items: sanitizeItems((persisted as { items?: unknown } | null)?.items),
      }),
    },
  ),
)
