import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { ApiError } from '@/api/apiError'
import { createQueryClient, shouldRetry } from '@/app/queryClient'
import { products } from '@/mocks/data/products'
import { server } from '@/mocks/server'
import { resetTestState } from '@/test/resetTestState'
import { productKeys } from './queryKeys'
import { useProduct } from './useProduct'
import { useProducts } from './useProducts'

afterEach(resetTestState)

function wrapperFor(queryClient = createQueryClient()) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('queryKeys', () => {
  it('genera claves estables por dominio', () => {
    expect(productKeys.all).toEqual(['products'])
    expect(productKeys.detail(7)).toEqual(['products', 7])
  })
})

describe('shouldRetry', () => {
  it('no reintenta errores 4xx', () => {
    expect(shouldRetry(0, new ApiError('no existe', 404))).toBe(false)
  })

  it('reintenta como máximo una vez el resto de errores', () => {
    expect(shouldRetry(0, new ApiError('caído', 500))).toBe(true)
    expect(shouldRetry(1, new ApiError('caído', 500))).toBe(false)
    expect(shouldRetry(0, new ApiError('sin red', null))).toBe(true)
  })
})

describe('useProducts', () => {
  it('reutiliza la caché fresca sin una nueva petición', async () => {
    let requests = 0
    server.use(
      http.get('*/products', () => {
        requests += 1
        return HttpResponse.json(products)
      }),
    )
    const wrapper = wrapperFor()

    const first = renderHook(() => useProducts(), { wrapper })
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true))
    first.unmount()

    const second = renderHook(() => useProducts(), { wrapper })
    expect(second.result.current.isLoading).toBe(false)
    expect(second.result.current.data).toHaveLength(products.length)
    expect(requests).toBe(1)
  })
})

describe('useProduct', () => {
  it('muestra de inmediato el producto que ya está en el listado', async () => {
    const queryClient = createQueryClient()
    queryClient.setQueryData(productKeys.all, products)
    const { result } = renderHook(() => useProduct(7), { wrapper: wrapperFor(queryClient) })
    expect(result.current.data?.name).toBe('Hamburguesa')
    expect(result.current.isPlaceholderData).toBe(true)
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false))
  })

  it('no reintenta un 404', async () => {
    let requests = 0
    server.use(
      http.get('*/products/:id', () => {
        requests += 1
        return HttpResponse.json({}, { status: 404 })
      }),
    )
    const { result } = renderHook(() => useProduct(999), { wrapper: wrapperFor() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 404 })
    expect(requests).toBe(1)
  })
})
