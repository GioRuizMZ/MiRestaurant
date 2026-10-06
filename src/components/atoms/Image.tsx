import { useState } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'

interface ImageProps {
  src: string
  /** Texto alternativo. Vacío para una imagen decorativa (también oculta el fondo de reemplazo). */
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  /** cover recorta para llenar el área; contain muestra la imagen completa. */
  fit?: 'cover' | 'contain'
}

/** Imagen con un fondo neutro del mismo tamaño si no hay URL o si falla la carga. */
export function Image({ src, alt, className, loading = 'lazy', fit = 'cover' }: ImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    const a11y = alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true }
    return (
      <div
        {...a11y}
        data-testid="image-fallback"
        className={cx('flex items-center justify-center bg-line/60 text-muted', className)}
      >
        <Icon name="image" className="size-8 opacity-60" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={cx(fit === 'contain' ? 'object-contain' : 'object-cover', className)}
    />
  )
}
