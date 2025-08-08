import { create } from 'zustand';
import { Entry, FilterOptions, Attachment } from '@/types';

interface AppState {
  // Entries
  entries: Entry[];
  filteredEntries: Entry[];
  filters: FilterOptions;
  
  // UI State
  isLoading: boolean;
  selectedEntry: Entry | null;
  isModalOpen: boolean;
  
  // Actions
  setEntries: (entries: Entry[]) => void;
  addEntry: (entry: Entry) => void;
  updateEntry: (id: string, entry: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;
  setFilters: (filters: FilterOptions) => void;
  applyFilters: () => void;
  setLoading: (loading: boolean) => void;
  setSelectedEntry: (entry: Entry | null) => void;
  setModalOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  entries: [],
  filteredEntries: [],
  filters: {},
  isLoading: false,
  selectedEntry: null,
  isModalOpen: false,

  // Actions
  setEntries: (entries) => {
    set({ entries });
    get().applyFilters();
  },

  addEntry: (entry) => {
    const { entries } = get();
    const newEntries = [entry, ...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    set({ entries: newEntries });
    get().applyFilters();
  },

  updateEntry: (id, updatedEntry) => {
    const { entries } = get();
    const newEntries = entries.map(entry =>
      entry._id === id ? { ...entry, ...updatedEntry } : entry
    );
    set({ entries: newEntries });
    get().applyFilters();
  },

  deleteEntry: (id) => {
    const { entries } = get();
    const newEntries = entries.filter(entry => entry._id !== id);
    set({ entries: newEntries });
    get().applyFilters();
  },

  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { entries, filters } = get();
    let filtered = [...entries];

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(entry => 
        new Date(entry.date) >= filters.startDate!
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(entry => 
        new Date(entry.date) <= filters.endDate!
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(entry => entry.category === filters.category);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by media presence
    if (filters.hasMedia !== undefined) {
      filtered = filtered.filter(entry =>
        filters.hasMedia ? entry.attachments.length > 0 : entry.attachments.length === 0
      );
    }

    // Filter by importance
    if (filters.isImportant !== undefined) {
      filtered = filtered.filter(entry => entry.isImportant === filters.isImportant);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(entry =>
        filters.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    set({ filteredEntries: filtered });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedEntry: (entry) => set({ selectedEntry: entry }),
  setModalOpen: (open) => set({ isModalOpen: open }),
}));
