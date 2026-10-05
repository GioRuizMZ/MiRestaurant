export interface AppEnv {
  apiUrl: string
  apiToken: string
}

const REQUIRED = ['VITE_API_URL', 'VITE_API_TOKEN'] as const

/** Lee y valida la configuración. Lanza un error que nombra la primera variable faltante. */
export function readEnv(source: Record<string, unknown>): AppEnv {
  for (const name of REQUIRED) {
    const value = source[name]
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Falta la variable de entorno ${name}. Revisa tu archivo .env (ver .env.example).`)
    }
  }
  return {
    apiUrl: String(source.VITE_API_URL).trim().replace(/\/+$/, ''),
    apiToken: String(source.VITE_API_TOKEN).trim(),
  }
}

let cached: AppEnv | null = null

export function getEnv(): AppEnv {
  cached ??= readEnv(import.meta.env)
  return cached
}
