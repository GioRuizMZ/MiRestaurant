import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/productService'
import { productKeys } from './queryKeys'

export function useProducts() {
  return useQuery({ queryKey: productKeys.all, queryFn: getProducts })
}
