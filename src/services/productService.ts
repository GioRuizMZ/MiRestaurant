import { apiClient } from '@/api/apiClient'
import type { Product } from '@/types/product'

/**
 * Forma de un producto según la API. El contrato es provisional (design §9):
 * si la API real usa otros nombres, el mapeo se ajusta solo aquí.
 */
export interface ProductDto {
  id: number | string
  name?: string
  title?: string
  description?: string
  price: number | string
  sku?: string
}

export function toProduct(dto: ProductDto): Product {
  return {
    id: Number(dto.id),
    name: dto.name ?? dto.title ?? '',
    description: dto.description ?? '',
    price: Number(dto.price),
    sku: dto.sku ?? '',
  }
}

export async function getProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<ProductDto[]>('/products')
  return data.map(toProduct)
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await apiClient.get<ProductDto>(`/products/${id}`)
  return toProduct(data)
}
