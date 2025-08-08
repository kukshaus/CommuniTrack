import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Entry, EntryFilter } from '@/types'

interface AppStore {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  
  // Entries state
  entries: Entry[]
  setEntries: (entries: Entry[]) => void
  addEntry: (entry: Entry) => void
  updateEntry: (id: string, entry: Partial<Entry>) => void
  deleteEntry: (id: string) => void
  
  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  
  // Filter state
  filters: EntryFilter
  setFilters: (filters: EntryFilter) => void
  clearFilters: () => void
  
  // Actions
  reset: () => void
}

const initialState = {
  user: null,
  entries: [],
  isLoading: false,
  error: null,
  filters: {}
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      
      setEntries: (entries) => set({ entries }),
      
      addEntry: (entry) => set((state) => ({
        entries: [entry, ...state.entries]
      })),
      
      updateEntry: (id, updatedEntry) => set((state) => ({
        entries: state.entries.map(entry =>
          entry.id === id ? { ...entry, ...updatedEntry } : entry
        )
      })),
      
      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter(entry => entry.id !== id)
      })),
      
      setIsLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      setFilters: (filters) => set({ filters }),
      
      clearFilters: () => set({ filters: {} }),
      
      reset: () => set(initialState)
    }),
    {
      name: 'communitrack-store',
      partialize: (state) => ({ 
        user: state.user,
        filters: state.filters 
      })
    }
  )
)

// Selectors
export const useUser = () => useStore((state) => state.user)
export const useEntries = () => useStore((state) => state.entries)
export const useFilters = () => useStore((state) => state.filters)
export const useIsLoading = () => useStore((state) => state.isLoading)
export const useError = () => useStore((state) => state.error)