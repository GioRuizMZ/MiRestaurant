import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QuantitySelector } from '@/components/molecules/QuantitySelector'
import { resetTestState } from '@/test/resetTestState'
import type { CartItem } from '@/types/product'
import { OrderList } from './OrderList'
import { OrderSummary } from './OrderSummary'

afterEach(resetTestState)

const items: CartItem[] = [
  { id: 7, sku: 'PLT-007', name: 'Hamburguesa', image: '/mock-images/7.svg', price: 12.5, quantity: 2 },
  { id: 9, sku: 'ENT-009', name: 'Ensalada', image: '', price: 8, quantity: 1 },
]

function renderList() {
  const handlers = { onIncrement: vi.fn(), onDecrement: vi.fn(), onRemove: vi.fn() }
  render(<OrderList items={items} {...handlers} />)
  const line = (name: string) => screen.getByRole('article', { name })
  return { handlers, line }
}

describe('QuantitySelector con itemLabel', () => {
  it('nombra los botones con el producto', () => {
    render(<QuantitySelector value={1} onChange={vi.fn()} itemLabel="Ensalada" />)
    expect(screen.getByRole('group', { name: 'Cantidad de Ensalada' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aumentar cantidad de Ensalada' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disminuir cantidad de Ensalada' })).toBeDisabled()
  })
})

describe('OrderList', () => {
  it('muestra cada línea con precio unitario, cantidad y subtotal', () => {
    const { line } = renderList()
    expect(within(screen.getByRole('list', { name: 'Líneas del pedido' })).getAllByRole('listitem')).toHaveLength(2)
    const hamburguesa = line('Hamburguesa')
    expect(hamburguesa.querySelector('img')).toHaveAttribute('src', '/mock-images/7.svg')
    expect(within(hamburguesa).getByText('$12.50')).toBeInTheDocument()
    expect(within(hamburguesa).getByTestId('quantity-value')).toHaveTextContent('2')
    expect(within(hamburguesa).getByTestId('line-subtotal')).toHaveTextContent('$25.00')
    expect(within(line('Ensalada')).getByTestId('image-fallback')).toBeInTheDocument()
  })

  it('con cantidad 1, disminuir sigue habilitado (quita la línea)', () => {
    const { handlers } = renderList()
    const decrease = screen.getByRole('button', { name: 'Disminuir cantidad de Ensalada' })
    expect(decrease).toBeEnabled()
    fireEvent.click(decrease)
    expect(handlers.onDecrement).toHaveBeenCalledWith(9)
  })

  it('avisa aumentar y quitar con el id de la línea', () => {
    const { handlers } = renderList()
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad de Hamburguesa' }))
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Hamburguesa' }))
    expect(handlers.onIncrement).toHaveBeenCalledWith(7)
    expect(handlers.onRemove).toHaveBeenCalledWith(7)
  })
})

describe('OrderSummary', () => {
  it('muestra el total de productos y el monto', () => {
    render(<OrderSummary count={3} total={33} onClear={vi.fn()} />)
    expect(screen.getByTestId('summary-count')).toHaveTextContent('3 productos')
    expect(screen.getByTestId('summary-total')).toHaveTextContent('$33.00')
  })

  it('vaciar pide confirmación y solo vacía al confirmar', () => {
    const onClear = vi.fn()
    render(<OrderSummary count={3} total={33} onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar pedido' }))
    expect(screen.getByRole('alertdialog', { name: '¿Vaciar el pedido?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClear).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Vaciar pedido' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar pedido' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, vaciar' }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
