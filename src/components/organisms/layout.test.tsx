import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { SearchBar } from '@/components/molecules/SearchBar'
import { resetTestState } from '@/test/resetTestState'
import { Sidebar } from './Sidebar'
import { TopBar, type TopBarProps } from './TopBar'

afterEach(resetTestState)

const inRouter = (ui: ReactElement, path = '/') => render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)

const topBarProps: TopBarProps = {
  orderCount: 0,
  orderTotal: 0,
  searchValue: '',
  onSearchChange: vi.fn(),
  onSearchClear: vi.fn(),
  sidebarOpen: true,
  onToggleSidebar: vi.fn(),
}

describe('molecules', () => {
  it('SearchBar notifica cambios y muestra el botón para borrar solo con texto', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const { rerender } = render(<SearchBar value="" onChange={onChange} onClear={onClear} />)
    expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Borrar búsqueda' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar productos' }), { target: { value: 'ham' } })
    expect(onChange).toHaveBeenCalledWith('ham')
    rerender(<SearchBar value="ham" onChange={onChange} onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: 'Borrar búsqueda' }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('ErrorState ofrece reintentar', () => {
    const onRetry = vi.fn()
    render(<ErrorState title="Algo falló" onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Algo falló')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('EmptyState muestra título, descripción y acción', () => {
    render(<EmptyState title="Vacío" description="Nada por aquí" action={<button>Ir</button>} />)
    expect(screen.getByText('Vacío')).toBeInTheDocument()
    expect(screen.getByText('Nada por aquí')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir' })).toBeInTheDocument()
  })
})

describe('TopBar', () => {
  it('muestra el resumen del pedido recibido por props como enlace a /pedido', () => {
    inRouter(<TopBar {...topBarProps} orderCount={3} orderTotal={33} />)
    const summary = screen.getByRole('link', { name: 'Ver pedido: 3 productos, $33.00' })
    expect(summary).toHaveAttribute('href', '/pedido')
    expect(screen.getByTestId('order-count')).toHaveTextContent('3 productos')
    expect(screen.getByTestId('order-total')).toHaveTextContent('$33.00')
  })

  it('con el pedido vacío muestra 0 productos y $0.00', () => {
    inRouter(<TopBar {...topBarProps} />)
    expect(screen.getByTestId('order-count')).toHaveTextContent('0 productos')
    expect(screen.getByTestId('order-total')).toHaveTextContent('$0.00')
  })

  it('usa singular con 1 producto', () => {
    inRouter(<TopBar {...topBarProps} orderCount={1} orderTotal={12.5} />)
    expect(screen.getByTestId('order-count')).toHaveTextContent('1 producto')
  })

  it('el botón de menú refleja y alterna el estado del sidebar', () => {
    const onToggleSidebar = vi.fn()
    inRouter(<TopBar {...topBarProps} sidebarOpen={false} onToggleSidebar={onToggleSidebar} />)
    const menu = screen.getByRole('button', { name: 'Menú' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(menu)
    expect(onToggleSidebar).toHaveBeenCalledOnce()
  })
})

describe('Sidebar', () => {
  it('solo tiene el enlace "Menú" y lo resalta en el menú principal', () => {
    inRouter(<Sidebar open overlay={false} onClose={vi.fn()} />, '/')
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(within(nav).getAllByRole('link')).toHaveLength(1)
    expect(within(nav).getByRole('link', { name: 'Menú' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).queryByRole('link', { name: 'Pedido' })).not.toBeInTheDocument()
  })

  it('cerrado queda inerte y oculto para lectores de pantalla', () => {
    const { container } = inRouter(<Sidebar open={false} overlay={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).not.toBeInTheDocument()
    const aside = container.querySelector('#app-sidebar')!
    expect(aside).toHaveAttribute('inert')
    expect(aside).toHaveAttribute('aria-hidden', 'true')
  })

  it('anima el cambio con una transición de 200 ms', () => {
    const { container } = inRouter(<Sidebar open overlay onClose={vi.fn()} />)
    const aside = container.querySelector('#app-sidebar')!
    expect(aside.className).toContain('duration-200')
    expect(aside.className).toContain('translate-x-0')
  })

  it('en modo superpuesto se cierra al navegar', () => {
    const onClose = vi.fn()
    inRouter(<Sidebar open overlay onClose={onClose} />)
    fireEvent.click(screen.getByRole('link', { name: 'Menú' }))
    expect(onClose).toHaveBeenCalled()
  })
})
