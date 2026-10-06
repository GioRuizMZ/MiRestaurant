import axios from 'axios'
import { getEnv } from '@/config/env'
import { toApiError } from './apiError'

/** Único cliente HTTP de la aplicación. Solo lo usan los servicios. */
export const apiClient = axios.create({ timeout: 10_000 })

apiClient.interceptors.request.use((config) => {
  config.headers.set('Authorization', `Bearer ${getEnv().apiToken}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
