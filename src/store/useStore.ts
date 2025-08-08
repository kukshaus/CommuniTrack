import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Entry, FilterOptions, Attachment, User, AuthState } from '@/types';

interface AppState extends AuthState {
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
  
  // Auth Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  register: (username: string, password: string, name: string) => Promise<boolean>;
  hasAnyUsers: () => boolean;
}

// API helper functions
const apiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API call failed');
  }
  
  return data;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      entries: [],
      filteredEntries: [],
      filters: {},
      isLoading: false,
      selectedEntry: null,
      isModalOpen: false,
      
      // Auth state
      user: null,
      isAuthenticated: false,

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
    const { entries, filters, user } = get();
    let filtered = [...entries];

    // First filter by current user - users only see their own entries
    if (user) {
      filtered = filtered.filter(entry => entry.userId === user.id);
    }

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

  // Auth actions
  login: async (username: string, password: string) => {
    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      if (response.user) {
        // Convert date strings back to Date objects
        const user = {
          ...response.user,
          createdAt: new Date(response.user.createdAt),
          updatedAt: new Date(response.user.updatedAt),
        };
        set({ user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  register: async (username: string, password: string, name: string) => {
    try {
      const response = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, name }),
      });
      
      if (response.user) {
        // Convert date strings back to Date objects
        const user = {
          ...response.user,
          createdAt: new Date(response.user.createdAt),
          updatedAt: new Date(response.user.updatedAt),
        };
        // Auto-login the new user
        set({ user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  },

  hasAnyUsers: () => {
    // This will be checked by the component using an API call
    // For now, return false to trigger the API check
    return false;
  },
}),
{
  name: 'communitrack-storage',
  partialize: (state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }),
}
)
);
