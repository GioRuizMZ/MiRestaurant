import { useMemo } from 'react'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { ProductGrid } from '@/components/organisms/ProductGrid'
import { useProducts } from '@/hooks/queries/useProducts'
import { useAddToCart } from '@/hooks/useCart'
import { useProductSearch } from '@/hooks/useProductSearch'
import { formatProductCount } from '@/lib/formatProductCount'
import { sortProductsByName } from '@/lib/sortProductsByName'
import { useSearchStore } from '@/store/searchStore'
import type { Product } from '@/types/product'

const productHref = (product: Pick<Product, 'id'>) => `/producto/${product.id}`

/** Menú principal (spec product-catalog): productos de la A a la Z, filtrados por la búsqueda (spec product-search). */
export function CatalogPage() {
  const { data, isPending, isError, isFetching, error, refetch } = useProducts()
  const addToCart = useAddToCart()
  const clearSearch = useSearchStore((state) => state.clear)
  // Primero se filtra y después se ordena, así los resultados también quedan de la A a la Z.
  const { results, activeTerm } = useProductSearch(data ?? [])
  const products = useMemo(() => sortProductsByName(results), [results])

  const retrying = isError && isFetching
  const noMatches = activeTerm !== '' && products.length === 0

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Menú principal</h1>
        {!isPending && !isError && products.length > 0 && (
          <p data-testid="catalog-count" className="text-sm text-muted">
            {formatProductCount(products.length)}
          </p>
        )}
      </div>

      {isPending || retrying ? (
        <ProductGrid products={products} loading getProductHref={productHref} onAddProduct={addToCart} />
      ) : isError ? (
        <ErrorState title="No pudimos cargar los productos" message={error.message} onRetry={() => void refetch()} />
      ) : noMatches ? (
        <EmptyState
          title={`No encontramos productos para "${activeTerm}"`}
          description="Prueba con otro nombre."
          action={
            <Button variant="secondary" onClick={clearSearch}>
              Limpiar búsqueda
            </Button>
          }
        />
      ) : products.length === 0 ? (
        <EmptyState title="No hay productos disponibles" description="Vuelve a intentarlo más tarde." />
      ) : (
        <ProductGrid products={products} getProductHref={productHref} onAddProduct={(product) => addToCart(product)} />
      )}
    </section>
  )
}
