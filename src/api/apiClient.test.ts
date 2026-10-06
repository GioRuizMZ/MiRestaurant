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
  it('adjunta Authorization: Bearer con VITE_API_TOKEN', async () => {
    let authorization: string | null = null
    server.use(
      http.get('http://api.test/ping', ({ request }) => {
        authorization = request.headers.get('Authorization')
        return HttpResponse.json({})
      }),
    )
    await apiClient.get('http://api.test/ping')
    expect(authorization).toBe('Bearer test-token')
  })

  it('normaliza una respuesta 500', async () => {
    server.use(http.get('http://api.test/boom', () => HttpResponse.json({}, { status: 500 })))
    const error = await captureError(apiClient.get('http://api.test/boom'))
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(500)
    expect(error.message).toMatch(/servidor/i)
  })

  it('normaliza un error de red con status null', async () => {
    server.use(http.get('http://api.test/offline', () => HttpResponse.error()))
    const error = await captureError(apiClient.get('http://api.test/offline'))
    expect(error.status).toBeNull()
    expect(error.message).toMatch(/conexión/i)
  })

  it('indica que el token no es válido ante un 401', async () => {
    server.use(http.get('http://api.test/private', () => HttpResponse.json({}, { status: 401 })))
    const error = await captureError(apiClient.get('http://api.test/private'))
    expect(error.status).toBe(401)
    expect(error.message).toMatch(/token/i)
  })
})
