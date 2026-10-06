import { useState } from 'react'
import { cx } from '@/lib/cx'

interface ImageProps {
  src: string
  alt: string
  /** Si no hay imagen (o falla), se muestra la inicial de este texto sobre un fondo neutro. */
  fallbackText?: string
  className?: string
}

/** Imagen con carga diferida y un placeholder neutro si falla o no hay URL. */
export function Image({ src, alt, fallbackText, className }: ImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    const initial = fallbackText?.trim().charAt(0).toLocaleUpperCase('es') ?? ''
    return (
      <div
        role="img"
        aria-label={alt}
        className={cx('flex items-center justify-center bg-primary-50 text-muted select-none', className)}
      >
        {initial && (
          <span aria-hidden="true" className="text-4xl font-semibold tracking-tight text-primary-200">
            {initial}
          </span>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cx('object-cover', className)}
    />
  )
}
