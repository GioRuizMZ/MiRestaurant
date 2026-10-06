import { Link } from 'react-router'
import { Icon } from '@/components/atoms/Icon'

interface BackLinkProps {
  to: string
  children: string
}

/** Enlace de regreso con apariencia de botón. Es un enlace porque navega. */
export function BackLink({ to, children }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={
        'inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink ' +
        'transition-colors hover:border-primary hover:bg-primary hover:text-white ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
      }
    >
      <Icon name="arrow-left" className="size-4" />
      {children}
    </Link>
  )
}
