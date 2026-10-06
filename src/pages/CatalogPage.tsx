import { useMemo } from 'react'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { ProductGrid } from '@/components/organisms/ProductGrid'
import { useProducts } from '@/hooks/queries/useProducts'
import { useAddToCart } from '@/hooks/useCart'
import { sortProductsByName } from '@/lib/sortProductsByName'
import type { Product } from '@/types/product'

const productHref = (product: Pick<Product, 'id'>) => `/producto/${product.id}`

/** Menú principal (spec product-catalog): productos de la A a la Z. */
export function CatalogPage() {
  const { data, isPending, isError, isFetching, error, refetch } = useProducts()
  const addToCart = useAddToCart()
  const products = useMemo(() => sortProductsByName(data ?? []), [data])

  const retrying = isError && isFetching

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Menú principal</h1>
        {!isPending && !isError && products.length > 0 && (
          <p className="text-sm text-muted">{products.length} productos</p>
        )}
      </div>

      {isPending || retrying ? (
        <ProductGrid products={products} loading getProductHref={productHref} onAddProduct={addToCart} />
      ) : isError ? (
        <ErrorState title="No pudimos cargar los productos" message={error.message} onRetry={() => void refetch()} />
      ) : products.length === 0 ? (
        <EmptyState title="No hay productos disponibles" description="Vuelve a intentarlo más tarde." />
      ) : (
        <ProductGrid products={products} getProductHref={productHref} onAddProduct={(product) => addToCart(product)} />
      )}
    </section>
  )
}
