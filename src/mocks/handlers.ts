import { http, HttpResponse } from 'msw'
import type { Product } from '@/types/product'
import { findProduct, products } from './data/products'

// Las rutas usan comodín de origen para servir igual a cualquier VITE_API_URL.
export const PRODUCTS_URL = '*/products'
export const PRODUCT_URL = '*/products/:id'

export const handlers = [
  http.get(PRODUCTS_URL, () => HttpResponse.json(products)),
  http.get(PRODUCT_URL, ({ params }) => {
    const product = findProduct(Number(params.id))
    return product ? HttpResponse.json(product) : HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),
]

/** Handlers para escenarios concretos (se usan con server.use / worker.use). */
export const scenarioHandlers = {
  productsList: (list: Product[]) => http.get(PRODUCTS_URL, () => HttpResponse.json(list)),
  productsError: (status = 500) => http.get(PRODUCTS_URL, () => HttpResponse.json({}, { status })),
  productsPending: () => http.get(PRODUCTS_URL, () => new Promise<never>(() => {})),
  productError: (status = 500) => http.get(PRODUCT_URL, () => HttpResponse.json({}, { status })),
  productPending: () => http.get(PRODUCT_URL, () => new Promise<never>(() => {})),
  networkError: () => http.get(PRODUCTS_URL, () => HttpResponse.error()),
}
