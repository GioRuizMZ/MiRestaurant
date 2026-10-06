import { Link } from 'react-router'
import { Button } from '@/components/atoms/Button'
import { Image } from '@/components/atoms/Image'
import { Price } from '@/components/atoms/Price'
import type { Product } from '@/types/product'

export interface ProductCardProps {
  product: Pick<Product, 'id' | 'name' | 'price'>
  href: string
  onAdd: () => void
}

/**
 * Tarjeta de producto. El enlace del nombre se estira sobre toda la tarjeta
 * (stretched link) y el botón "Agregar" queda por encima para no navegar.
 */
export function ProductCard({ product, href, onAdd }: ProductCardProps) {
  return (
    <article
      className={
        'group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface ' +
        'transition duration-150 hover:border-primary-200 hover:shadow-md motion-safe:hover:-translate-y-0.5 ' +
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-canvas'
      }
    >
      <Image src="" alt={product.name} fallbackText={product.name} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-base font-medium text-ink">
            <Link to={href} className="outline-none after:absolute after:inset-0 after:content-['']">
              {product.name}
            </Link>
          </h2>
          <Price value={product.price} className="text-sm text-muted" />
        </div>
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
