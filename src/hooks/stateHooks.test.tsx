import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { products } from '@/mocks/data/products'
import { CART_STORAGE_KEY, useCartStore } from '@/store/cartStore'
import { useSearchStore } from '@/store/searchStore'
import { useUiStore } from '@/store/uiStore'
import { resetTestState } from '@/test/resetTestState'
import { useCart, useOrderSummary } from './useCart'
import { useDebouncedValue } from './useDebouncedValue'

afterEach(resetTestState)

const [hamburguesa, , ensalada] = products

describe('useCart', () => {
  it('calcula el total de unidades y el total del pedido', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(hamburguesa, 2)
      result.current.addItem(ensalada)
    })
    expect(result.current.totalItems).toBe(3)
    expect(result.current.totalPrice).toBe(33)
  })
})

describe('useOrderSummary', () => {
  it('suma unidades y monto del pedido', () => {
    const { result } = renderHook(() => useOrderSummary())
    expect(result.current).toEqual({ count: 0, total: 0 })
    act(() => {
      useCartStore.getState().addItem(hamburguesa, 2)
      useCartStore.getState().addItem(ensalada)
    })
    expect(result.current).toEqual({ count: 3, total: 33 })
  })

  it('no vuelve a renderizar por cambios en otros stores', () => {
    let renders = 0
    renderHook(() => {
      renders += 1
      return useOrderSummary()
    })
    act(() => useUiStore.getState().toggleSidebar())
    act(() => useSearchStore.getState().setTerm('hamb'))
    expect(renders).toBe(1)
    act(() => useCartStore.getState().addItem(hamburguesa))
    expect(renders).toBe(2)
  })
})

describe('useDebouncedValue', () => {
  it('entrega el valor después de la pausa', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'ab' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('ab')
  })
})

describe('searchStore y uiStore', () => {
  it('no persisten su estado', () => {
    act(() => {
      useSearchStore.getState().setTerm('cafe')
      useUiStore.getState().setSidebarOpen(false)
    })
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
    expect(keys.filter((key) => key !== CART_STORAGE_KEY)).toEqual([])
  })
})
