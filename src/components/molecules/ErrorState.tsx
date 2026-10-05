import { Button } from '@/components/atoms/Button'

interface ErrorStateProps {
  title: string
  message?: string
  onRetry: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-card border border-danger/20 bg-surface px-6 py-12 text-center"
    >
      <p className="text-lg font-semibold text-ink">{title}</p>
      {message && <p className="max-w-md text-sm text-muted">{message}</p>}
      <Button variant="secondary" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}
