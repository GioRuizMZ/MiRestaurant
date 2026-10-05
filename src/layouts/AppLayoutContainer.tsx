import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AppLayout } from '@/components/templates/AppLayout'
import { useCartCount } from '@/hooks/useCart'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSearchStore } from '@/store/searchStore'
import { DESKTOP_QUERY, useUiStore } from '@/store/uiStore'

/** Conecta los stores con el template AppLayout y renderiza la ruta activa en el Outlet. */
export function AppLayoutContainer() {
  const { pathname } = useLocation()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const cartCount = useCartCount()
  const searchTerm = useSearchStore((state) => state.term)
  const setSearchTerm = useSearchStore((state) => state.setTerm)
  const clearSearch = useSearchStore((state) => state.clear)
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen)

  // En móvil el panel lateral se cierra con cada navegación.
  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false)
  }, [pathname, isDesktop, setSidebarOpen])

  return (
    <AppLayout
      isDesktop={isDesktop}
      cartCount={cartCount}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearchClear={clearSearch}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={toggleSidebar}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      <Outlet />
    </AppLayout>
  )
}
