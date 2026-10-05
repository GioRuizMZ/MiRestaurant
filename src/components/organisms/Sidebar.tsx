import { NavItem } from '@/components/molecules/NavItem'
import { cx } from '@/lib/cx'

export interface SidebarProps {
  open: boolean
  /** En móvil el sidebar es un panel superpuesto que se cierra al navegar. */
  overlay: boolean
  onClose: () => void
}

export function Sidebar({ open, overlay, onClose }: SidebarProps) {
  const closeOnNavigate = overlay ? onClose : undefined

  return (
    <>
      {overlay && open && (
        <div aria-hidden="true" onClick={onClose} className="fixed inset-0 top-16 z-20 bg-ink/40" />
      )}
      <aside
        id="app-sidebar"
        hidden={!open}
        data-state={open ? 'open' : 'collapsed'}
        className={cx(
          'w-60 shrink-0 border-r border-line bg-surface p-3',
          overlay ? 'fixed top-16 bottom-0 left-0 z-30 shadow-xl' : 'sticky top-16 h-[calc(100dvh-4rem)]',
        )}
      >
        <nav aria-label="Navegación principal" className="flex flex-col gap-1">
          <NavItem to="/" end label="Catálogo" icon="home" onClick={closeOnNavigate} />
          <NavItem to="/cart" label="Carrito" icon="cart" onClick={closeOnNavigate} />
        </nav>
      </aside>
    </>
  )
}
