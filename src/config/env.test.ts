import { describe, expect, it } from 'vitest'
import { readEnv } from './env'

describe('readEnv', () => {
  it('usa la URL absoluta tal cual, solo sin espacios', () => {
    expect(readEnv({ VITE_API_URL: ' https://api.test/GetProducts?KioskID=87 ', VITE_API_TOKEN: ' abc ' })).toEqual({
      apiUrl: 'https://api.test/GetProducts?KioskID=87',
      apiToken: 'abc',
    })
  })

  it('falla nombrando VITE_API_TOKEN cuando falta el token', () => {
    expect(() => readEnv({ VITE_API_URL: 'https://api.test' })).toThrow(/VITE_API_TOKEN/)
  })

  it('falla nombrando VITE_API_URL cuando la URL está vacía', () => {
    expect(() => readEnv({ VITE_API_URL: '  ', VITE_API_TOKEN: 'abc' })).toThrow(/VITE_API_URL/)
  })
})
