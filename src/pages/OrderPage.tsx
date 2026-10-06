import { Link } from 'react-router'
import { BackLink } from '@/components/molecules/BackLink'
import { EmptyState } from '@/components/molecules/EmptyState'
import { OrderList } from '@/components/organisms/OrderList'
import { OrderSummary } from '@/components/organisms/OrderSummary'
import { useCart } from '@/hooks/useCart'

/** Pantalla del pedido (spec shopping-cart), en `/pedido`. Solo usa el store: no pide nada a la API. */
export function OrderPage() {
  const { items, totalItems, totalPrice, increment, decrement, removeItem, clear } = useCart()

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <BackLink to="/">Volver al menú principal</BackLink>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Tu pedido</h1>

      {items.length === 0 ? (
        <EmptyState
          title="Tu pedido está vacío"
          description="Agrega productos desde el menú principal."
          action={
            <Link to="/" className="font-medium text-primary hover:underline">
              Ver el menú
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          <OrderList items={items} onIncrement={increment} onDecrement={decrement} onRemove={removeItem} />
          <OrderSummary count={totalItems} total={totalPrice} onClear={clear} />
        </div>
      )}
    </section>
  )
}
