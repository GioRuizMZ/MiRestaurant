import { useId } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Image } from '@/components/atoms/Image'
import { Price } from '@/components/atoms/Price'
import { Skeleton } from '@/components/atoms/Skeleton'
import { QuantitySelector } from '@/components/molecules/QuantitySelector'
import type { Product } from '@/types/product'

export interface ProductInfoProps {
  product: Pick<Product, 'name' | 'description' | 'price' | 'sku' | 'image'>
  quantity: number
  onQuantityChange: (quantity: number) => void
  onAdd: () => void
  /** Aviso tras agregar al carrito. Vacío si no hay nada que anunciar. */
  addedMessage?: string
}

const LAYOUT = 'grid gap-8 md:grid-cols-2 md:items-start md:gap-12'

/** Información completa de un producto (imagen, nombre, SKU, precio y descripción) y agregar al carrito. */
export function ProductInfo({ product, quantity, onQuantityChange, onAdd, addedMessage = '' }: ProductInfoProps) {
  const titleId = useId()

  return (
    <article aria-labelledby={titleId} className={LAYOUT}>
      <Image
        src={product.image}
        alt={product.name}
        loading="eager"
        fit="contain"
        className="aspect-square w-full rounded-card border border-line bg-surface p-6"
      />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 id={titleId} className="text-3xl font-semibold tracking-tight text-ink">
            {product.name}
          </h1>
          <p className="text-sm text-muted">
            SKU: <span className="font-mono text-ink">{product.sku || '—'}</span>
          </p>
        </div>
        <Price value={product.price} className="text-2xl text-ink" />
        <section className="flex flex-col gap-2 border-t border-line pt-6">
          <h2 className="text-sm font-medium tracking-wide text-muted uppercase">Descripción</h2>
          <p className="leading-relaxed text-ink">{product.description || 'Este producto no tiene descripción.'}</p>
        </section>
        <div className="flex flex-col gap-3 border-t border-line pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <QuantitySelector value={quantity} onChange={onQuantityChange} />
            <Button size="lg" onClick={onAdd} className="flex-1 sm:flex-none">
              <Icon name="cart" />
              Agregar al carrito
            </Button>
          </div>
          <p role="status" className="min-h-5 text-sm font-medium text-success">
            {addedMessage}
          </p>
        </div>
      </div>
    </article>
  )
}

/** Skeleton con la forma de ProductInfo. */
export function ProductInfoSkeleton() {
  return (
    <div role="status" aria-label="Cargando producto" className={LAYOUT}>
      <Skeleton className="aspect-square w-full rounded-card" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-7 w-24" />
        <div className="flex flex-col gap-2 border-t border-line pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex gap-3 border-t border-line pt-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    </div>
  )
}
