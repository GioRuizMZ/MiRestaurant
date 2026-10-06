import type { Product } from '@/types/product'

/** Ruta de las imágenes de prueba. MSW las sirve como SVG (ver handlers.ts). */
export const mockImageUrl = (id: number) => `/mock-images/${id}.svg`

/** Datos de prueba compartidos por los niveles @component y @e2e (spec testing-bdd). */
export const products: Product[] = [
  {
    id: 7,
    sku: 'PLT-007',
    name: 'Hamburguesa',
    description: 'Hamburguesa de res a la parrilla con queso cheddar, lechuga, tomate y salsa de la casa.',
    price: 12.5,
    image: mockImageUrl(7),
  },
  {
    id: 8,
    sku: 'PLT-008',
    name: 'Hot dog',
    description: 'Salchicha artesanal en pan brioche con cebolla caramelizada y mostaza.',
    price: 7.25,
    image: mockImageUrl(8),
  },
  {
    id: 9,
    sku: 'ENT-009',
    name: 'Ensalada',
    description: 'Mezcla de hojas verdes, aguacate, tomate cherry y vinagreta de limón.',
    price: 8,
    image: mockImageUrl(9),
  },
  {
    id: 10,
    sku: 'CAF-010',
    name: 'Café americano',
    description: 'Café de especialidad preparado al momento.',
    price: 3.5,
    image: mockImageUrl(10),
  },
  {
    id: 11,
    sku: 'BEB-011',
    name: 'Coca-Cola',
    description: 'Lata de 355 ml bien fría.',
    price: 2.5,
    image: mockImageUrl(11),
  },
]

export function findProduct(id: number): Product | undefined {
  return products.find((product) => product.id === id)
}
