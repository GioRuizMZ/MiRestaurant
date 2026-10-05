import { Link } from 'react-router'
import { Badge } from '@/components/atoms/Badge'
import { Icon } from '@/components/atoms/Icon'
import { IconButton } from '@/components/atoms/IconButton'
import { SearchBar } from '@/components/molecules/SearchBar'

export interface TopBarProps {
  cartCount: number
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function TopBar({
  cartCount,
  searchValue,
  onSearchChange,
  onSearchClear,
  sidebarOpen,
  onToggleSidebar,
}: TopBarProps) {
  const cartLabel = cartCount > 0 ? `Carrito, ${cartCount} unidades` : 'Carrito vacío'

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
      <Link
        to="/cart"
        aria-label={cartLabel}
        className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-ink hover:bg-primary-50"
      >
        <Icon name="cart" className="size-6" />
        {cartCount > 0 && (
          <Badge className="absolute -top-0.5 -right-0.5">
            <span data-testid="cart-count">{cartCount}</span>
          </Badge>
        )}
      </Link>
    </header>
  )
}
