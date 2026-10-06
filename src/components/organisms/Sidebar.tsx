import { NavItem } from '@/components/molecules/NavItem'
import { cx } from '@/lib/cx'

export interface SidebarProps {
  open: boolean
  /** En móvil el sidebar es un panel superpuesto que se cierra al navegar. */
  overlay: boolean
  onClose: () => void
}

const TRANSITION = 'transition-all duration-200 ease-out motion-reduce:transition-none'

/**
 * Barra lateral con animación de apertura y cierre (spec app-layout):
 * en escritorio anima su ancho y en móvil se desliza sobre un fondo que se oscurece.
 * Cerrada queda `inert` y `aria-hidden`, así sus enlaces no reciben foco ni se anuncian.
 */
export function Sidebar({ open, overlay, onClose }: SidebarProps) {
  const closeOnNavigate = overlay ? onClose : undefined

  return (
    <>
      {overlay && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className={cx(
            'fixed inset-0 top-16 z-20 bg-ink/40',
            TRANSITION,
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        />
      )}
      <aside
        id="app-sidebar"
        data-state={open ? 'open' : 'collapsed'}
        aria-hidden={!open}
        inert={!open}
        className={cx(
          'shrink-0 overflow-hidden border-line bg-surface',
          TRANSITION,
          overlay
            ? cx('fixed top-16 bottom-0 left-0 z-30 w-60 border-r shadow-xl', open ? 'translate-x-0' : '-translate-x-full')
            : cx('sticky top-16 h-[calc(100dvh-4rem)]', open ? 'w-60 border-r' : 'w-0 border-r-0'),
        )}
      >
        <nav aria-label="Navegación principal" className="flex w-60 flex-col gap-1 p-3">
          <NavItem to="/" end label="Menú" icon="menu-book" onClick={closeOnNavigate} />
        </nav>
      </aside>
    </>
  )
}
