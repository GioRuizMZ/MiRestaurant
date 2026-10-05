import { create } from 'zustand'

interface SearchState {
  term: string
  setTerm: (term: string) => void
  clear: () => void
}

/** Término de búsqueda. No se persiste: se conserva al navegar y se pierde al recargar. */
export const useSearchStore = create<SearchState>()((set) => ({
  term: '',
  setTerm: (term) => set({ term }),
  clear: () => set({ term: '' }),
}))
