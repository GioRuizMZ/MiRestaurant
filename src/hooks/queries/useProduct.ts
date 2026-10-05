import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProduct } from '@/services/productService'
import type { Product } from '@/types/product'
import { productKeys } from './queryKeys'

/**
 * Detalle de un producto. Si el catálogo ya está en caché, muestra ese producto
 * de inmediato (placeholder) mientras consulta GET /products/:id.
 */
export function useProduct(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: Number.isInteger(id),
    placeholderData: () =>
      queryClient.getQueryData<Product[]>(productKeys.all)?.find((product) => product.id === id),
  })
}
