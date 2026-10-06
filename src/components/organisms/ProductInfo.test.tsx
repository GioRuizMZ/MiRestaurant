import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { products } from '@/mocks/data/products'
import { resetTestState } from '@/test/resetTestState'
import { ProductInfo, ProductInfoSkeleton } from './ProductInfo'

afterEach(resetTestState)

const hamburguesa = products[0]

const noop = () => {}
const actions = { quantity: 1, onQuantityChange: noop, onAdd: noop }

describe('ProductInfo', () => {
  it('muestra imagen, nombre, descripción, precio y SKU', () => {
    render(<ProductInfo product={hamburguesa} {...actions} />)
    expect(screen.getByRole('img', { name: 'Hamburguesa' })).toHaveAttribute('src', hamburguesa.image)
    expect(screen.getByRole('heading', { level: 1, name: 'Hamburguesa' })).toBeInTheDocument()
    expect(screen.getByText(hamburguesa.description)).toBeInTheDocument()
    expect(screen.getByText('$12.50')).toBeInTheDocument()
    expect(screen.getByText('PLT-007')).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Hamburguesa' })).toBeInTheDocument()
  })

  it('muestra un fondo neutro con nombre accesible si no hay imagen', () => {
    render(<ProductInfo product={{ ...hamburguesa, image: '' }} {...actions} />)
    expect(screen.getByRole('img', { name: 'Hamburguesa' })).toHaveAttribute('data-testid', 'image-fallback')
  })

  it('avisa cuando el producto no tiene descripción', () => {
    render(<ProductInfo product={{ ...hamburguesa, description: '' }} {...actions} />)
    expect(screen.getByText('Este producto no tiene descripción.')).toBeInTheDocument()
  })

  it('el contador y "Agregar al carrito" avisan a quien los usa', () => {
    const onQuantityChange = vi.fn()
    const onAdd = vi.fn()
    render(
      <ProductInfo
        product={hamburguesa}
        quantity={2}
        onQuantityChange={onQuantityChange}
        onAdd={onAdd}
        addedMessage="Agregado al carrito: 2 × Hamburguesa"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
    expect(onQuantityChange).toHaveBeenCalledWith(3)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    expect(onAdd).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent('Agregado al carrito: 2 × Hamburguesa')
  })

  it('el skeleton anuncia la carga', () => {
    render(<ProductInfoSkeleton />)
    expect(screen.getByRole('status', { name: 'Cargando producto' })).toBeInTheDocument()
  })
})
