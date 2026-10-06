import { useQuery, useQueryClient } from '@tanstack/react-query'
import { findProductById, getProducts } from '@/services/productService'
import type { Product } from '@/types/product'
import { productKeys } from './queryKeys'

/**
 * Detalle de un producto. La API no tiene endpoint por id, así que se busca en el listado:
 * si está fresco en caché no hay petición, y si no (URL directa o recarga) se pide una vez
 * y queda en caché también para el menú. Mientras tanto muestra el producto del listado.
 */
export function useProduct(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () =>
      findProductById(
        await queryClient.ensureQueryData({
          queryKey: productKeys.all,
          queryFn: getProducts,
          revalidateIfStale: true,
        }),
        id,
      ),
    enabled: Number.isInteger(id),
    placeholderData: () =>
      queryClient.getQueryData<Product[]>(productKeys.all)?.find((product) => product.id === id),
  })
}
