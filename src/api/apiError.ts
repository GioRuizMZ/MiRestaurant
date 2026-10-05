import { isAxiosError } from 'axios'

/** Error normalizado de la aplicación (spec api-client). `status` es null en errores de red. */
export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  get isClientError(): boolean {
    return this.status !== null && this.status >= 400 && this.status < 500
  }
}

function messageForStatus(status: number): string {
  if (status === 401) return 'El token de la API no es válido o expiró.'
  if (status === 403) return 'No tienes permiso para acceder a este recurso.'
  if (status === 404) return 'El recurso solicitado no existe.'
  if (status >= 500) return 'El servidor no pudo procesar la solicitud. Intenta de nuevo más tarde.'
  return `La solicitud no pudo completarse (código ${status}).`
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status !== undefined) return new ApiError(messageForStatus(status), status)
    return new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', null)
  }
  return new ApiError('Ocurrió un error inesperado.', null)
}
