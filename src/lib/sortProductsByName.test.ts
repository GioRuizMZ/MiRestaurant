import { describe, expect, it } from 'vitest'
import { sortProductsByName } from './sortProductsByName'

const names = (list: { name: string }[]) => list.map((item) => item.name)
const byNames = (...values: string[]) => values.map((name) => ({ name }))

describe('sortProductsByName', () => {
  it('ordena de la A a la Z', () => {
    const sorted = sortProductsByName(byNames('Hot dog', 'Hamburguesa', 'Ensalada', 'Coca-Cola', 'Café americano'))
    expect(names(sorted)).toEqual(['Café americano', 'Coca-Cola', 'Ensalada', 'Hamburguesa', 'Hot dog'])
  })

  it('no distingue mayúsculas ni tildes y ubica la Ñ después de la N', () => {
    const sorted = sortProductsByName(byNames('Ñoquis', 'agua mineral', 'Éclair', 'Burrito', 'Nachos'))
    expect(names(sorted)).toEqual(['agua mineral', 'Burrito', 'Éclair', 'Nachos', 'Ñoquis'])
  })

  it('no modifica la lista original', () => {
    const original = byNames('B', 'A')
    sortProductsByName(original)
    expect(names(original)).toEqual(['B', 'A'])
  })
})
