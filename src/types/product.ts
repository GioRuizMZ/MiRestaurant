export interface Product {
  id: number
  name: string
  description: string
  price: number
  sku: string
}

/** Línea del carrito: guarda los datos del producto al momento de agregarlo. */
export interface CartItem {
  id: number
  name: string
  sku: string
  price: number
  quantity: number
}
