import { create } from 'zustand'

export const DESKTOP_QUERY = '(min-width: 768px)'

function isDesktopViewport(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(DESKTOP_QUERY).matches
    : true
}

interface UiState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

/** En escritorio el sidebar empieza expandido; en móvil, oculto (spec app-layout). */
export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: isDesktopViewport(),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

export function resetUiStore(): void {
  useUiStore.setState({ sidebarOpen: isDesktopViewport() })
}
