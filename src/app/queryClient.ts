import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/apiError'

export const STALE_TIME_MS = 5 * 60 * 1000
const MAX_RETRIES = 1

/** Un error 4xx no se reintenta; el resto se reintenta como máximo una vez (spec server-state). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.isClientError) return false
  return failureCount < MAX_RETRIES
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
    },
  })
}
