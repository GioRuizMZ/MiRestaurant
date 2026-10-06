import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { products } from '@/mocks/data/products'
import { envelope, PRODUCTS_URL } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { resetTestState } from '@/test/resetTestState'
import { getProduct, getProducts, toProduct } from './productService'

afterEach(resetTestState)

describe('productService', () => {
  it('pide los productos exactamente a VITE_API_URL, sin agregar rutas', async () => {
    let requestedUrl = ''
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        requestedUrl = request.url
        return HttpResponse.json(envelope([]))
      }),
    )
    await getProducts()
    expect(requestedUrl).toBe('http://api.test/SrKioscoRemote/GetProducts?KioskID=8')
  })

  it('obtiene el listado desde data aunque isSuccess sea false', async () => {
    await expect(getProducts()).resolves.toEqual(products)
  })

  it('devuelve una lista vacía si data es null', async () => {
    server.use(http.get(PRODUCTS_URL, () => HttpResponse.json({ ...envelope([]), data: null })))
    await expect(getProducts()).resolves.toEqual([])
  })

  it('obtiene un producto por id desde la lista', async () => {
    await expect(getProduct(7)).resolves.toMatchObject({ id: 7, name: 'Hamburguesa' })
  })

  it('rechaza con status 404 si el producto no existe', async () => {
    await expect(getProduct(999)).rejects.toMatchObject({ status: 404 })
  })

  it('mapea la respuesta real de la API a Product', () => {
    expect(
      toProduct({
        id: 717,
        sku: 'PIBE',
        name: 'Pistacho Beat',
        description: 'Croissant ultra crujiente',
        price: '85.0000',
      }),
    ).toEqual({ id: 717, sku: 'PIBE', name: 'Pistacho Beat', description: 'Croissant ultra crujiente', price: 85 })
  })

  it('tolera campos nulos', () => {
    expect(toProduct({ id: '3', sku: null, name: null, description: null, price: 2.5 })).toEqual({
      id: 3,
      sku: '',
      name: '',
      description: '',
      price: 2.5,
    })
  })
})
