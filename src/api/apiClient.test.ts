import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { resetTestState } from '@/test/resetTestState'
import { apiClient } from './apiClient'
import { ApiError } from './apiError'

afterEach(resetTestState)

async function captureError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    return error as ApiError
  }
  throw new Error('Se esperaba que la petición fallara')
}

describe('apiClient', () => {
  it('envía las peticiones relativas a VITE_API_URL', async () => {
    let requestedUrl = ''
    server.use(
      http.get('http://api.test/products', ({ request }) => {
        requestedUrl = request.url
        return HttpResponse.json([])
      }),
    )
    await apiClient.get('/products')
    expect(requestedUrl).toBe('http://api.test/products')
  })

  it('adjunta Authorization: Bearer con VITE_API_TOKEN', async () => {
    let authorization: string | null = null
    server.use(
      http.get('*/ping', ({ request }) => {
        authorization = request.headers.get('Authorization')
        return HttpResponse.json({})
      }),
    )
    await apiClient.get('/ping')
    expect(authorization).toBe('Bearer test-token')
  })

  it('normaliza una respuesta 500', async () => {
    server.use(http.get('*/boom', () => HttpResponse.json({}, { status: 500 })))
    const error = await captureError(apiClient.get('/boom'))
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(500)
    expect(error.message).toMatch(/servidor/i)
  })

  it('normaliza un error de red con status null', async () => {
    server.use(http.get('*/offline', () => HttpResponse.error()))
    const error = await captureError(apiClient.get('/offline'))
    expect(error.status).toBeNull()
    expect(error.message).toMatch(/conexión/i)
  })

  it('indica que el token no es válido ante un 401', async () => {
    server.use(http.get('*/private', () => HttpResponse.json({}, { status: 401 })))
    const error = await captureError(apiClient.get('/private'))
    expect(error.status).toBe(401)
    expect(error.message).toMatch(/token/i)
  })
})
