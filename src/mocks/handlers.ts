import { http, HttpResponse } from 'msw'
import type { ApiEnvelope, ProductDto } from '@/services/productService'
import type { Product } from '@/types/product'
import { products } from './data/products'

// Endpoint de productos de SrKiosco. El comodín de origen sirve a cualquier host
// de VITE_API_URL y MSW ignora la query (?KioskID=...) al comparar.
export const PRODUCTS_URL = '*/SrKioscoRemote/GetProducts'

/** Respuesta con la forma real de la API (isSuccess llega en false aun con éxito). */
export function envelope(list: ProductDto[]): ApiEnvelope<ProductDto[]> {
  return { isSuccess: false, code: '0000', message: 'Procesado exitosamente.', data: list }
}

export const handlers = [http.get(PRODUCTS_URL, () => HttpResponse.json(envelope(products)))]

/** Handlers para escenarios concretos (se usan con server.use / worker.use). */
export const scenarioHandlers = {
  productsList: (list: Product[]) => http.get(PRODUCTS_URL, () => HttpResponse.json(envelope(list))),
  productsError: (status = 500) => http.get(PRODUCTS_URL, () => HttpResponse.json({}, { status })),
  productsPending: () => http.get(PRODUCTS_URL, () => new Promise<never>(() => {})),
  networkError: () => http.get(PRODUCTS_URL, () => HttpResponse.error()),
}
