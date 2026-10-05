import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetTestState } from '@/test/resetTestState'
import { Badge } from './Badge'
import { Button } from './Button'
import { IconButton } from './IconButton'
import { Image } from './Image'
import { Input } from './Input'
import { Price } from './Price'
import { Skeleton } from './Skeleton'
import { Spinner } from './Spinner'

afterEach(resetTestState)

describe('atoms', () => {
  it('Button es type="button" por defecto y usa los tokens primarios', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Agregar</Button>)
    const button = screen.getByRole('button', { name: 'Agregar' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button.className).toContain('bg-primary')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('IconButton expone su etiqueta accesible', () => {
    render(<IconButton icon="menu" label="Menú" />)
    expect(screen.getByRole('button', { name: 'Menú' })).toBeInTheDocument()
  })

  it('Input reenvía sus props', () => {
    render(<Input aria-label="Nombre" defaultValue="Ana" />)
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')
  })

  it('Price formatea en moneda', () => {
    render(<Price value={12.5} />)
    expect(screen.getByText('$12.50')).toBeInTheDocument()
  })

  it('Badge muestra su contenido', () => {
    render(<Badge>3</Badge>)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('Image usa un fondo neutro si no hay URL', () => {
    render(<Image src="" alt="Hamburguesa" />)
    expect(screen.getByRole('img', { name: 'Hamburguesa' }).tagName).toBe('DIV')
  })

  it('Image muestra el fondo neutro si la imagen falla', () => {
    render(<Image src="https://example.test/x.png" alt="Ensalada" />)
    fireEvent.error(screen.getByRole('img', { name: 'Ensalada' }))
    expect(screen.getByRole('img', { name: 'Ensalada' }).tagName).toBe('DIV')
  })

  it('Skeleton está oculto para lectores de pantalla y Spinner anuncia la carga', () => {
    const { container } = render(
      <>
        <Skeleton />
        <Spinner />
      </>,
    )
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument()
  })
})
