import type { RouteObject } from 'react-router'
import { AppLayoutContainer } from '@/layouts/AppLayoutContainer'
import { CatalogPage } from '@/pages/CatalogPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrderPage } from '@/pages/OrderPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayoutContainer />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'producto/:id', element: <ProductDetailPage /> },
      { path: 'pedido', element: <OrderPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
