import { Link } from 'react-router'
import { EmptyState } from '@/components/molecules/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      title="Página no encontrada"
      description="La dirección que buscas no existe o fue movida."
      action={
        <Link to="/" className="font-medium text-primary hover:underline">
          Volver al catálogo
        </Link>
      }
    />
  )
}
