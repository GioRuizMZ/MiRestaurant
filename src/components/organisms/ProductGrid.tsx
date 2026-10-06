import { Skeleton } from '@/components/atoms/Skeleton'
import { ProductCard } from '@/components/molecules/ProductCard'
import type { Product } from '@/types/product'

type GridProduct = Pick<Product, 'id' | 'name' | 'price'>

export interface ProductGridProps<T extends GridProduct> {
  products: T[]
  loading?: boolean
  getProductHref: (product: T) => string
  onAddProduct: (product: T) => void
}

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6'
const SKELETON_COUNT = 8

export function ProductGrid<T extends GridProduct>({
  products,
  loading = false,
  getProductHref,
  onAddProduct,
}: ProductGridProps<T>) {
  if (loading) {
    return (
      <div role="status" aria-label="Cargando productos" className={GRID}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <div
            key={index}
            data-testid="product-skeleton"
            className="flex flex-col gap-6 rounded-card border border-line bg-surface p-5"
          >
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul aria-label="Productos" className={GRID}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} href={getProductHref(product)} onAdd={() => onAddProduct(product)} />
        </li>
      ))}
    </ul>
  )
}
