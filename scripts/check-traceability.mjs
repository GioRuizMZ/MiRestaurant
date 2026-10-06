// Verifica que cada escenario de las specs tenga un `Scenario` con el mismo nombre
// en un `.feature` cuyo `Feature` sea la capacidad (spec testing-bdd).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

/**
 * Capacidades de comportamiento verificadas con features (design §10).
 * Cada rama feature/* agrega aquí su capacidad junto con sus .feature.
 */
export const TRACED_CAPABILITIES = ['app-layout', 'product-catalog', 'product-detail', 'product-search', 'shopping-cart']

const ROOT = process.cwd()

function walk(dir, predicate) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  return entries.flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return walk(path, predicate)
    return predicate(path) ? [path] : []
  })
}

/** Escenarios por capacidad desde las specs vigentes y los cambios activos (no archivados). */
function specScenarios() {
  const byCapability = new Map()
  const specFiles = [
    ...walk(join(ROOT, 'openspec', 'specs'), (path) => path.endsWith(`${sep}spec.md`)),
    ...walk(join(ROOT, 'openspec', 'changes'), (path) => path.endsWith(`${sep}spec.md`) && !path.includes(`${sep}archive${sep}`)),
  ]
  for (const file of specFiles) {
    const parts = relative(ROOT, file).split(sep)
    const capability = parts[parts.length - 2]
    const names = byCapability.get(capability) ?? new Set()
    for (const match of readFileSync(file, 'utf8').matchAll(/^####\s+Scenario:\s*(.+?)\s*$/gm)) {
      names.add(match[1])
    }
    byCapability.set(capability, names)
  }
  return byCapability
}

/** Escenarios por Feature en los .feature de ambos niveles. */
function featureScenarios() {
  const byFeature = new Map()
  const featureFiles = [
    ...walk(join(ROOT, 'src'), (path) => path.endsWith('.feature')),
    ...walk(join(ROOT, 'tests', 'e2e'), (path) => path.endsWith('.feature')),
  ]
  for (const file of featureFiles) {
    const content = readFileSync(file, 'utf8')
    const feature = /^\s*Feature:\s*(.+?)\s*$/m.exec(content)?.[1]
    if (!feature) continue
    const names = byFeature.get(feature) ?? new Set()
    for (const match of content.matchAll(/^\s*Scenario(?: Outline)?:\s*(.+?)\s*$/gm)) names.add(match[1])
    byFeature.set(feature, names)
  }
  return byFeature
}

const specs = specScenarios()
const features = featureScenarios()
const missing = []

for (const capability of TRACED_CAPABILITIES) {
  const expected = specs.get(capability)
  if (!expected) {
    missing.push(`${capability}: no se encontró la spec de la capacidad`)
    continue
  }
  const implemented = features.get(capability) ?? new Set()
  for (const scenario of expected) {
    if (!implemented.has(scenario)) missing.push(`${capability}: falta "Scenario: ${scenario}"`)
  }
}

if (missing.length > 0) {
  console.error(`Trazabilidad incompleta (${missing.length} escenario(s) sin .feature):`)
  for (const line of missing) console.error(`  - ${line}`)
  process.exit(1)
}

const total = TRACED_CAPABILITIES.reduce((sum, capability) => sum + (specs.get(capability)?.size ?? 0), 0)
console.log(`Trazabilidad OK: ${total} escenario(s) en ${TRACED_CAPABILITIES.length} capacidad(es).`)
