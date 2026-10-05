import { cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import { server } from '@/mocks/server'
import { useCartStore } from '@/store/cartStore'
import { useSearchStore } from '@/store/searchStore'
import { resetUiStore } from '@/store/uiStore'
import { setViewportWidth } from './viewport'

/** Deja el entorno como al inicio: DOM vacío, handlers por defecto, stores y viewport iniciales. */
export function resetTestState(): void {
  cleanup()
  vi.useRealTimers()
  server.resetHandlers()
  localStorage.clear()
  useCartStore.setState({ items: [] })
  useSearchStore.setState({ term: '' })
  setViewportWidth(1280)
  resetUiStore()
}
