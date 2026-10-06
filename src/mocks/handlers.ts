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

// Imágenes de los fixtures (/mock-images/<id>.svg): un SVG neutro generado, así el nivel @e2e
// muestra imágenes reales sin archivos en public/ ni dependencia del blob de la API.
export const MOCK_IMAGES_URL = '*/mock-images/:file'

function mockImageSvg(label: string): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#e5e5e5"/>' +
    `<text x="200" y="160" font-family="sans-serif" font-size="32" fill="#737373" text-anchor="middle">${label}</text>` +
    '</svg>'
  )
}

export const handlers = [
  http.get(PRODUCTS_URL, () => HttpResponse.json(envelope(products))),
  http.get(MOCK_IMAGES_URL, ({ params }) =>
    new HttpResponse(mockImageSvg(String(params.file).replace(/\.svg$/, '')), {
      headers: { 'Content-Type': 'image/svg+xml' },
    }),
  ),
]

/** Handlers para escenarios concretos (se usan con server.use / worker.use). */
export const scenarioHandlers = {
  productsList: (list: Product[]) => http.get(PRODUCTS_URL, () => HttpResponse.json(envelope(list))),
  productsError: (status = 500) => http.get(PRODUCTS_URL, () => HttpResponse.json({}, { status })),
  productsPending: () => http.get(PRODUCTS_URL, () => new Promise<never>(() => {})),
  networkError: () => http.get(PRODUCTS_URL, () => HttpResponse.error()),
}
