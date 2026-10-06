import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AppLayout } from '@/components/templates/AppLayout'
import { useOrderSummary } from '@/hooks/useCart'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { activeSearchTerm } from '@/hooks/useProductSearch'
import { useSearchStore } from '@/store/searchStore'
import { DESKTOP_QUERY, useUiStore } from '@/store/uiStore'

/** Conecta los stores con el template AppLayout y renderiza la ruta activa en el Outlet. */
export function AppLayoutContainer() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const order = useOrderSummary()
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

  // Escribir un término activo fuera del menú lleva al menú, donde se ven los resultados (spec product-search).
  // Va en el handler y no en un efecto: abrir un detalle con una búsqueda activa no debe devolver al menú.
  function changeSearch(value: string) {
    setSearchTerm(value)
    if (activeSearchTerm(value) !== '' && pathname !== '/') navigate('/')
  }

  return (
    <AppLayout
      isDesktop={isDesktop}
      orderCount={order.count}
      orderTotal={order.total}
      searchValue={searchTerm}
      onSearchChange={changeSearch}
      onSearchClear={clearSearch}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={toggleSidebar}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      <Outlet />
    </AppLayout>
  )
}
