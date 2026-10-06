export interface Product {
  id: number
  name: string
  description: string
  price: number
  sku: string
  /** URL absoluta de la imagen. Cadena vacía si el producto no tiene imagen. */
  image: string
}

/** Línea del carrito: guarda los datos del producto al momento de agregarlo. */
export interface CartItem {
  id: number
  name: string
  sku: string
  price: number
  quantity: number
}
