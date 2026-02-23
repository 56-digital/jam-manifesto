import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Suggestion {
  id: string
  selectedText: string
  suggestion: string
  prefix: string
  suffix: string
  createdAt: number
}

interface SuggestionsState {
  suggestions: Suggestion[]
  addSuggestion: (s: Omit<Suggestion, 'id' | 'createdAt'>) => void
  updateSuggestion: (id: string, text: string) => void
  removeSuggestion: (id: string) => void
  clearAll: () => void
}

export const useSuggestionsStore = create<SuggestionsState>()(
  persist(
    (set) => ({
      suggestions: [],

      addSuggestion: (s) =>
        set((state) => ({
          suggestions: [
            ...state.suggestions,
            {
              ...s,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: Date.now(),
            },
          ],
        })),

      updateSuggestion: (id, text) =>
        set((state) => ({
          suggestions: state.suggestions.map((s) =>
            s.id === id ? { ...s, suggestion: text } : s,
          ),
        })),

      removeSuggestion: (id) =>
        set((state) => ({
          suggestions: state.suggestions.filter((s) => s.id !== id),
        })),

      clearAll: () => set({ suggestions: [] }),
    }),
    { name: 'manifesto-suggestions' },
  ),
)
