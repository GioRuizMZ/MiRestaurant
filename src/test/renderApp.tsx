import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/app/providers'
import { STALE_TIME_MS } from '@/app/queryClient'
import { routes } from '@/app/routes'

/** QueryClient aislado por escenario, sin reintentos para que los errores se vean al instante. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: STALE_TIME_MS, retry: false, refetchOnWindowFocus: false } },
  })
}

interface RenderOptions {
  queryClient?: QueryClient
  advanceTimers?: (ms: number) => unknown
}

/** Renderiza la aplicación completa (layout + rutas) en la ruta indicada. */
export function renderApp(path = '/', { queryClient = createTestQueryClient(), advanceTimers }: RenderOptions = {}) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup(advanceTimers ? { advanceTimers } : undefined)
  const view = render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { ...view, router, queryClient, user }
}

/** Renderiza un componente suelto con los providers de la app. */
export function renderWithProviders(ui: ReactElement, { queryClient = createTestQueryClient() } = {}) {
  const user = userEvent.setup()
  const view = render(<AppProviders queryClient={queryClient}>{ui}</AppProviders>)
  return { ...view, queryClient, user }
}
