type Listener = (event: MediaQueryListEvent) => void

const queries = new Map<string, Set<Listener>>()

function evaluate(query: string): boolean {
  const min = /min-width:\s*(\d+)px/.exec(query)
  const max = /max-width:\s*(\d+)px/.exec(query)
  if (min && window.innerWidth < Number(min[1])) return false
  if (max && window.innerWidth > Number(max[1])) return false
  return true
}

/** matchMedia simulado para jsdom: evalúa min/max-width contra window.innerWidth. */
export function installMatchMedia(): void {
  window.matchMedia = (query: string): MediaQueryList => {
    const listeners = queries.get(query) ?? new Set<Listener>()
    queries.set(query, listeners)
    return {
      media: query,
      get matches() {
        return evaluate(query)
      },
      onchange: null,
      addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
      removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
      addListener: (listener: Listener) => listeners.add(listener),
      removeListener: (listener: Listener) => listeners.delete(listener),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList
  }
}

export function setViewportWidth(width: number): void {
  window.innerWidth = width
  for (const [query, listeners] of queries) {
    const event = { matches: evaluate(query), media: query } as MediaQueryListEvent
    listeners.forEach((listener) => listener(event))
  }
}
