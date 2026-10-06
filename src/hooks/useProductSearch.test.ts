import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { products } from '@/mocks/data/products'
import { useSearchStore } from '@/store/searchStore'
import { resetTestState } from '@/test/resetTestState'
import { activeSearchTerm, filterProductsByName, SEARCH_DEBOUNCE_MS, useProductSearch } from './useProductSearch'

afterEach(resetTestState)

const names = (list: { name: string }[]) => list.map((product) => product.name)

describe('activeSearchTerm', () => {
  it('se activa con más de 3 caracteres sin contar espacios', () => {
    expect(activeSearchTerm('Ham')).toBe('')
    expect(activeSearchTerm('  Ham  ')).toBe('')
    expect(activeSearchTerm(' Hamb ')).toBe('Hamb')
  })
})

describe('filterProductsByName', () => {
  it('ignora mayúsculas y tildes', () => {
    expect(names(filterProductsByName(products, 'CAFE'))).toEqual(['Café americano'])
  })

  it('encuentra el término en medio del nombre', () => {
    expect(names(filterProductsByName(products, 'amer'))).toEqual(['Café americano'])
  })

  it('devuelve todos sin término y ninguno sin coincidencias', () => {
    expect(filterProductsByName(products, '')).toHaveLength(products.length)
    expect(filterProductsByName(products, 'pizza')).toEqual([])
  })
})

describe('useProductSearch', () => {
  it('filtra después del debounce', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useProductSearch(products))
    act(() => useSearchStore.getState().setTerm('Ensa'))
    expect(result.current.results).toHaveLength(products.length)
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS))
    expect(names(result.current.results)).toEqual(['Ensalada'])
    expect(result.current.activeTerm).toBe('Ensa')
  })
})
