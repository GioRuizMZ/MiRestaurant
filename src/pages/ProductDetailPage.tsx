import { useState } from 'react'
import { useParams } from 'react-router'
import { ApiError } from '@/api/apiError'
import { BackLink } from '@/components/molecules/BackLink'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { ProductInfo, ProductInfoSkeleton } from '@/components/organisms/ProductInfo'
import { useProduct } from '@/hooks/queries/useProduct'
import { useAddToCart } from '@/hooks/useCart'
import type { Product } from '@/types/product'

const BACK_LABEL = 'Volver al menú principal'

/** Solo se aceptan ids numéricos: cualquier otro valor es un producto inexistente. */
function parseProductId(value: string | undefined): number {
  return value && /^\d+$/.test(value) ? Number(value) : Number.NaN
}

/** Detalle del producto (spec product-detail), en `/producto/:id`. */
export function ProductDetailPage() {
  const rawId = useParams().id
  // La key reinicia la cantidad y el aviso al pasar de un producto a otro.
  return <ProductDetail key={rawId} id={parseProductId(rawId)} />
}

function ProductDetail({ id }: { id: number }) {
  const { data: product, isPending, isError, isFetching, error, refetch } = useProduct(id)
  const addToCart = useAddToCart()
  const [quantity, setQuantity] = useState(1)
  const [addedMessage, setAddedMessage] = useState('')

  const notFound = !Number.isInteger(id) || (error instanceof ApiError && error.status === 404)
  const retrying = isError && isFetching

  function changeQuantity(next: number) {
    setQuantity(next)
    setAddedMessage('')
  }

  function add(item: Product) {
    addToCart(item, quantity)
    setAddedMessage(`Agregado al pedido: ${quantity} × ${item.name}`)
    setQuantity(1)
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <BackLink to="/">{BACK_LABEL}</BackLink>
      </div>

      {notFound ? (
        <EmptyState
          title="Producto no encontrado"
          description="El producto que buscas no existe o ya no está disponible."
        />
      ) : product ? (
        <ProductInfo
          product={product}
          quantity={quantity}
          onQuantityChange={changeQuantity}
          onAdd={() => add(product)}
          addedMessage={addedMessage}
        />
      ) : isPending || retrying ? (
        <ProductInfoSkeleton />
      ) : (
        <ErrorState title="No pudimos cargar el producto" message={error?.message} onRetry={() => void refetch()} />
      )}
    </section>
  )
}
