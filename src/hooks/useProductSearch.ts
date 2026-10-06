import { useMemo } from 'react'
import { normalizeText } from '@/lib/normalizeText'
import { useSearchStore } from '@/store/searchStore'
import type { Product } from '@/types/product'
import { useDebouncedValue } from './useDebouncedValue'

/** Pausa de escritura antes de filtrar: el escenario pide resultados en menos de 300 ms. */
export const SEARCH_DEBOUNCE_MS = 250
/** El filtro se activa con más de 3 caracteres (sin espacios al inicio ni al final). */
export const SEARCH_MIN_LENGTH = 4

/** Término activo: sin espacios en los extremos y con el largo mínimo. Vacío si no aplica. */
export function activeSearchTerm(term: string): string {
  const trimmed = term.trim()
  return trimmed.length >= SEARCH_MIN_LENGTH ? trimmed : ''
}

/** Productos cuyo nombre contiene el término, sin distinguir mayúsculas ni tildes. */
export function filterProductsByName<T extends Pick<Product, 'name'>>(products: T[], term: string): T[] {
  const needle = normalizeText(term)
  if (!needle) return products
  return products.filter((product) => normalizeText(product.name).includes(needle))
}

/** Filtra en el cliente con el término del buscador (spec product-search). */
export function useProductSearch<T extends Pick<Product, 'name'>>(products: T[]) {
  const term = useSearchStore((state) => state.term)
  const active = activeSearchTerm(useDebouncedValue(term, SEARCH_DEBOUNCE_MS))
  const results = useMemo(() => filterProductsByName(products, active), [products, active])
  return { results, activeTerm: active }
}
