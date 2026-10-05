import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/app/providers'
import { createQueryClient } from '@/app/queryClient'
import { routes } from '@/app/routes'
import { getEnv } from '@/config/env'
import './index.css'

const rootElement = document.getElementById('root')!

async function enableMocking(): Promise<void> {
  if (import.meta.env.MODE !== 'e2e') return
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

function start(): void {
  // Sin configuración válida la app no arranca ni envía peticiones (spec api-client).
  try {
    getEnv()
  } catch (error) {
    rootElement.textContent = error instanceof Error ? error.message : String(error)
    throw error
  }

  const router = createBrowserRouter(routes)
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders queryClient={createQueryClient()}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
}

void enableMocking().then(start)
