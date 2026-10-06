/** "1 producto" o "N productos". */
export function formatProductCount(count: number): string {
  return `${count} ${count === 1 ? 'producto' : 'productos'}`
}
