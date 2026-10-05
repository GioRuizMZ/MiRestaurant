import { afterEach, describe, expect, it } from 'vitest'
import { products } from '@/mocks/data/products'
import { resetTestState } from '@/test/resetTestState'
import { getProduct, getProducts, toProduct } from './productService'

afterEach(resetTestState)

describe('productService', () => {
  it('obtiene el listado de productos', async () => {
    await expect(getProducts()).resolves.toEqual(products)
  })

  it('obtiene un producto por id', async () => {
    await expect(getProduct(7)).resolves.toMatchObject({ id: 7, name: 'Hamburguesa' })
  })

  it('rechaza con status 404 si el producto no existe', async () => {
    await expect(getProduct(999)).rejects.toMatchObject({ status: 404 })
  })

  it('mapea respuestas con nombres alternativos y tipos en texto', () => {
    expect(toProduct({ id: '3', title: 'Té', price: '2.5' })).toEqual({
      id: 3,
      name: 'Té',
      description: '',
      price: 2.5,
      sku: '',
    })
  })
})
