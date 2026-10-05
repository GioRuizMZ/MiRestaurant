import { useState } from 'react'
import { cx } from '@/lib/cx'

interface ImageProps {
  src: string
  alt: string
  className?: string
}

/** Imagen con carga diferida y un fondo neutro si falla o no hay URL. */
export function Image({ src, alt, className }: ImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <div role="img" aria-label={alt} className={cx('bg-line/60', className)} />
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
