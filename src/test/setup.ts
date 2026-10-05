import '@testing-library/jest-dom/vitest'
import { afterAll, beforeAll } from 'vitest'
import { server } from '@/mocks/server'
import { installMatchMedia, setViewportWidth } from './viewport'

installMatchMedia()
setViewportWidth(1280)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

// La limpieza (DOM, handlers de MSW, stores) NO se hace en afterEach: en los .feature
// cada step es un test y el estado debe sobrevivir entre steps del mismo escenario.
// Usa resetTestState() en AfterEachScenario o en el afterEach de cada archivo de test.
