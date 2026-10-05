import { afterEach, describe, expect, it } from 'vitest'
import { products } from '@/mocks/data/products'
import { resetTestState } from '@/test/resetTestState'
import { CART_STORAGE_KEY, sanitizeItems, useCartStore } from './cartStore'

afterEach(resetTestState)

const [hamburguesa, , ensalada] = products
const cart = () => useCartStore.getState()

describe('cartStore', () => {
  it('crea una línea al agregar un producto nuevo', () => {
    cart().addItem(hamburguesa)
    expect(cart().items).toEqual([
      { id: 7, name: 'Hamburguesa', price: 12.5, sku: hamburguesa.sku, quantity: 1 },
    ])
  })

  it('acumula la cantidad si el producto ya está en el carrito', () => {
    cart().addItem(hamburguesa)
    cart().addItem(hamburguesa, 3)
    expect(cart().items).toHaveLength(1)
    expect(cart().items[0].quantity).toBe(4)
  })

  it('decrement desde 1 quita la línea', () => {
    cart().addItem(ensalada)
    cart().decrement(ensalada.id)
    expect(cart().items).toEqual([])
  })

  it('increment, removeItem y clear modifican el pedido', () => {
    cart().addItem(hamburguesa)
    cart().addItem(ensalada)
    cart().increment(hamburguesa.id)
    expect(cart().items.find((item) => item.id === hamburguesa.id)?.quantity).toBe(2)
    cart().removeItem(hamburguesa.id)
    expect(cart().items.map((item) => item.id)).toEqual([ensalada.id])
    cart().clear()
    expect(cart().items).toEqual([])
  })

  it('persiste el carrito en localStorage', () => {
    cart().addItem(hamburguesa, 2)
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}')
    expect(stored.state.items[0]).toMatchObject({ id: 7, quantity: 2 })
  })

  it('restaura el carrito persistido al rehidratar', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        state: { items: [{ id: 7, name: 'Hamburguesa', sku: 'PLT-007', price: 12.5, quantity: 2 }] },
        version: 1,
      }),
    )
    await useCartStore.persist.rehydrate()
    expect(cart().items).toEqual([{ id: 7, name: 'Hamburguesa', sku: 'PLT-007', price: 12.5, quantity: 2 }])
  })

  it('arranca vacío si los datos persistidos están corruptos', async () => {
    localStorage.setItem(CART_STORAGE_KEY, '{esto no es json')
    await useCartStore.persist.rehydrate()
    expect(cart().items).toEqual([])
  })

  it('descarta líneas con forma inválida', () => {
    expect(sanitizeItems([{ id: 1 }, null, { id: 2, name: 'a', sku: 'X', price: 1, quantity: 1 }])).toHaveLength(1)
    expect(sanitizeItems('nada')).toEqual([])
  })
})
