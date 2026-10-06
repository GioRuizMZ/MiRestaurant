import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetTestState } from '@/test/resetTestState'
import { QuantitySelector } from './QuantitySelector'

afterEach(resetTestState)

describe('QuantitySelector', () => {
  it('muestra el valor y avisa al aumentar o disminuir', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={2} onChange={onChange} />)
    expect(screen.getByTestId('quantity-value')).toHaveTextContent('2')
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disminuir cantidad' }))
    expect(onChange.mock.calls).toEqual([[3], [1]])
  })

  it('deshabilita disminuir en el mínimo', () => {
    render(<QuantitySelector value={1} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Disminuir cantidad' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Aumentar cantidad' })).toBeEnabled()
  })

  it('deshabilita aumentar en el máximo', () => {
    render(<QuantitySelector value={99} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Aumentar cantidad' })).toBeDisabled()
  })
})
