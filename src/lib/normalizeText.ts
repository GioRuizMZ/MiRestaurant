/** Minúsculas y sin tildes, para comparar textos sin distinguir acentos ni mayúsculas. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}
