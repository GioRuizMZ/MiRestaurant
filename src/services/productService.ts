import { apiClient } from '@/api/apiClient'
import { ApiError } from '@/api/apiError'
import { getEnv } from '@/config/env'
import type { Product } from '@/types/product'

/** Sobre con el que responde la API de SrKiosco. */
export interface ApiEnvelope<T> {
  isSuccess: boolean
  code: string
  message: string
  data: T | null
}

/** Producto tal como lo devuelve la API. El mapeo a `Product` se hace solo aquí. */
export interface ProductDto {
  id: number | string
  sku?: string | null
  name?: string | null
  description?: string | null
  image?: string | null
  price: number | string
}

export function toProduct(dto: ProductDto): Product {
  return {
    id: Number(dto.id),
    sku: dto.sku ?? '',
    name: dto.name ?? '',
    description: dto.description ?? '',
    price: Number(dto.price),
    image: dto.image?.trim() ?? '',
  }
}

/**
 * Lista de productos. VITE_API_URL es la URL absoluta del endpoint
 * (incluye ruta y KioskID) y se usa tal cual, sin agregarle nada.
 * No se usa `isSuccess`: la API lo devuelve en false aun cuando responde bien.
 */
export async function getProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<ApiEnvelope<ProductDto[]>>(getEnv().apiUrl)
  return (data.data ?? []).map(toProduct)
}

/** Busca un producto en el listado. Si no está, lanza un ApiError 404 como lo haría un endpoint por id. */
export function findProductById(list: Product[], id: number): Product {
  const product = list.find((item) => item.id === id)
  if (!product) throw new ApiError('El producto solicitado no existe.', 404)
  return product
}

/** La API no expone un endpoint por id: el producto se busca en la lista. */
export async function getProduct(id: number): Promise<Product> {
  return findProductById(await getProducts(), id)
}
