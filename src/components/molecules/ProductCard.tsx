import { Link } from 'react-router'
import { Button } from '@/components/atoms/Button'
import { Image } from '@/components/atoms/Image'
import { Price } from '@/components/atoms/Price'
import type { Product } from '@/types/product'

export interface ProductCardProps {
  product: Pick<Product, 'id' | 'name' | 'price' | 'image'>
  href: string
  onAdd: () => void
}

/**
 * Tarjeta de producto: imagen, nombre y precio. El enlace del nombre se estira sobre toda
 * la tarjeta (stretched link) y el botón "Agregar" queda por encima para no navegar.
 * La imagen es decorativa: el nombre ya lo anuncia el enlace.
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
      <Image src={product.image} alt="" className="aspect-[4/3] w-full border-b border-line" />
      <div className="flex flex-1 flex-col justify-between gap-6 p-5">
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
      </div>
    </article>
  )
}
