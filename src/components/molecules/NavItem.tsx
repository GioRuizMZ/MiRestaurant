import { NavLink } from 'react-router'
import { Icon, type IconName } from '@/components/atoms/Icon'
import { cx } from '@/lib/cx'

interface NavItemProps {
  to: string
  label: string
  icon: IconName
  end?: boolean
  onClick?: () => void
}

/** Enlace de navegación que se resalta (y marca aria-current) cuando su ruta está activa. */
export function NavItem({ to, label, icon, end, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cx(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-primary-50 text-primary-700' : 'text-ink hover:bg-canvas',
        )
      }
    >
      <Icon name={icon} />
      {label}
    </NavLink>
  )
}
