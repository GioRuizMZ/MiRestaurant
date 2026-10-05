import type { ReactNode } from 'react'
import { Sidebar } from '@/components/organisms/Sidebar'
import { TopBar, type TopBarProps } from '@/components/organisms/TopBar'

export interface AppLayoutProps extends TopBarProps {
  isDesktop: boolean
  onCloseSidebar: () => void
  children: ReactNode
}

/** Estructura común: barra superior, barra lateral y área de contenido (spec app-layout). */
export function AppLayout({ isDesktop, onCloseSidebar, children, ...topBar }: AppLayoutProps) {
  return (
    <div className="min-h-dvh">
      <TopBar {...topBar} />
      <div className="flex">
        <Sidebar open={topBar.sidebarOpen} overlay={!isDesktop} onClose={onCloseSidebar} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
