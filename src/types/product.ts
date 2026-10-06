export interface Product {
  id: number
  name: string
  description: string
  price: number
  sku: string
  /** URL absoluta de la imagen. Cadena vacía si el producto no tiene imagen. */
  image: string
}

/** Línea del pedido: guarda los datos del producto al momento de agregarlo. */
export interface CartItem {
  id: number
  name: string
  sku: string
  /** URL de la imagen al momento de agregar. Cadena vacía si no tiene. */
  image: string
  price: number
  quantity: number
}
