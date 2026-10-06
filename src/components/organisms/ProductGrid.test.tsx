import { fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { products } from '@/mocks/data/products'
import { resetTestState } from '@/test/resetTestState'
import type { Product } from '@/types/product'
import { ProductGrid, type ProductGridProps } from './ProductGrid'

afterEach(resetTestState)

function renderGrid(props: Partial<ProductGridProps<Product>> = {}) {
  const onAddProduct = vi.fn()
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <ProductGrid
            products={products.slice(0, 2)}
            getProductHref={(product) => `/products/${product.id}`}
            onAddProduct={onAddProduct}
            {...props}
          />
        ),
      },
      { path: '/products/:id', element: <p>detalle</p> },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
  return { router, onAddProduct }
}

describe('ProductGrid', () => {
  it('muestra una tarjeta por producto con imagen, nombre y precio', () => {
    renderGrid()
    const cards = within(screen.getByRole('list', { name: 'Productos' })).getAllByRole('listitem')
    expect(cards).toHaveLength(2)
    expect(within(cards[0]).getByRole('img', { name: 'Hamburguesa' })).toHaveTextContent('H')
    expect(within(cards[0]).getByRole('link', { name: 'Hamburguesa' })).toHaveAttribute('href', '/products/7')
    expect(within(cards[0]).getByText('$12.50')).toBeInTheDocument()
  })

  it('el botón Agregar avisa el producto y no navega', () => {
    const { router, onAddProduct } = renderGrid()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Hamburguesa' }))
    expect(onAddProduct).toHaveBeenCalledWith(products[0])
    expect(router.state.location.pathname).toBe('/')
  })

  it('muestra skeletons mientras carga', () => {
    renderGrid({ loading: true })
    expect(screen.getByRole('status', { name: 'Cargando productos' })).toBeInTheDocument()
    expect(screen.getAllByTestId('product-skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByRole('list', { name: 'Productos' })).not.toBeInTheDocument()
  })
})
