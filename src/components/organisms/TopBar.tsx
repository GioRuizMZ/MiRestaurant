import { Link } from 'react-router'
import { Badge } from '@/components/atoms/Badge'
import { Icon } from '@/components/atoms/Icon'
import { IconButton } from '@/components/atoms/IconButton'
import { Price } from '@/components/atoms/Price'
import { SearchBar } from '@/components/molecules/SearchBar'
import { formatPrice } from '@/lib/formatPrice'
import { formatProductCount } from '@/lib/formatProductCount'

export interface TopBarProps {
  /** Total de unidades del pedido. */
  orderCount: number
  /** Monto total del pedido. */
  orderTotal: number
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function TopBar({
  orderCount,
  orderTotal,
  searchValue,
  onSearchChange,
  onSearchClear,
  sidebarOpen,
  onToggleSidebar,
}: TopBarProps) {
  const countLabel = formatProductCount(orderCount)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface px-3 sm:px-4">
      <IconButton
        icon="menu"
        label="Menú"
        aria-expanded={sidebarOpen}
        aria-controls="app-sidebar"
        onClick={onToggleSidebar}
      />
      <Link
        to="/"
        aria-label="MiRestaurant, ir al catálogo"
        className="hidden shrink-0 items-center gap-2 text-lg font-bold text-ink sm:flex"
      >
        <img src="/icon.png" alt="" className="size-8 rounded-md" />
        Mi<span className="text-primary">Restaurant</span>
      </Link>
      <div className="mx-auto w-full max-w-xl">
        <SearchBar value={searchValue} onChange={onSearchChange} onClear={onSearchClear} />
      </div>
      {/* Resumen del pedido (spec shopping-cart): siempre visible, también con el pedido vacío. */}
      <Link
        to="/pedido"
        aria-label={`Ver pedido: ${countLabel}, ${formatPrice(orderTotal)}`}
        className={
          'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-line px-2.5 text-ink transition-colors ' +
          'hover:border-primary hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-3'
        }
      >
        <span className="relative">
          <Icon name="cart" className="size-5" />
          <Badge className="absolute -top-2 -right-2.5 sm:hidden">{orderCount}</Badge>
        </span>
        <span data-testid="order-count" className="hidden text-sm text-muted sm:inline">
          {countLabel}
        </span>
        <span data-testid="order-total">
          <Price value={orderTotal} className="text-sm" />
        </span>
      </Link>
    </header>
  )
}
