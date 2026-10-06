import type { Product } from '@/types/product'

// sensitivity 'base': ignora mayúsculas y tildes; con locale 'es' la Ñ va después de la N.
const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true })

/** Devuelve una copia de los productos ordenada por nombre de la A a la Z. */
export function sortProductsByName<T extends Pick<Product, 'name'>>(products: readonly T[]): T[] {
  return [...products].sort((a, b) => collator.compare(a.name, b.name))
}
