import type { RouteObject } from 'react-router'
import { AppLayoutContainer } from '@/layouts/AppLayoutContainer'
import { CartPage } from '@/pages/CartPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayoutContainer />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'producto/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
