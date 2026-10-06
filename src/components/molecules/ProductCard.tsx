import { Link } from 'react-router'
import { Button } from '@/components/atoms/Button'
import { Price } from '@/components/atoms/Price'
import type { Product } from '@/types/product'

export interface ProductCardProps {
  product: Pick<Product, 'id' | 'name' | 'price'>
  href: string
  onAdd: () => void
}

/**
 * Tarjeta de producto: nombre y precio. El enlace del nombre se estira sobre toda
 * la tarjeta (stretched link) y el botón "Agregar" queda por encima para no navegar.
 */
export function ProductCard({ product, href, onAdd }: ProductCardProps) {
  return (
    <article
      className={
        'group relative flex h-full flex-col justify-between gap-6 rounded-card border border-line bg-surface p-5 ' +
        'transition duration-150 hover:border-primary-200 hover:shadow-md motion-safe:hover:-translate-y-0.5 ' +
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-canvas'
      }
    >
      <h2 className="line-clamp-2 text-base font-medium text-ink">
        <Link to={href} className="outline-none after:absolute after:inset-0 after:content-['']">
          {product.name}
        </Link>
      </h2>
      <div className="flex items-center justify-between gap-3">
        <Price value={product.price} className="text-lg text-ink" />
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Agregar ${product.name}`}
          onClick={onAdd}
          className="relative z-10 shrink-0"
        >
          Agregar
        </Button>
      </div>
    </article>
  )
}
