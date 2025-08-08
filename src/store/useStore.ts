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

// User storage - in a real app this would be in a database
interface StoredUser extends User {
  password: string;
}

// Initial empty users - will be populated from localStorage
let USERS: StoredUser[] = [];
let USER_COUNTER = 1;

// Load users from localStorage on initialization
if (typeof window !== 'undefined') {
  const storedUsers = localStorage.getItem('communitrack-users');
  if (storedUsers) {
    USERS = JSON.parse(storedUsers);
    USER_COUNTER = Math.max(...USERS.map(u => parseInt(u.id)), 0) + 1;
  }
}

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
    const storedUser = USERS.find(u => u.username === username && u.password === password);
    if (storedUser) {
      const { password: _, ...user } = storedUser; // Remove password from user object
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  register: async (username: string, password: string, name: string) => {
    // Check if username already exists
    if (USERS.some(u => u.username === username)) {
      return false;
    }

    // Create new user - first user becomes admin
    const isFirstUser = USERS.length === 0;
    const newUser: StoredUser = {
      id: USER_COUNTER.toString(),
      username,
      password,
      name,
      role: isFirstUser ? 'admin' : 'user'
    };

    USERS.push(newUser);
    USER_COUNTER++;

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('communitrack-users', JSON.stringify(USERS));
    }

    // Auto-login the new user
    const { password: _, ...user } = newUser;
    set({ user, isAuthenticated: true });
    return true;
  },

  hasAnyUsers: () => {
    return USERS.length > 0;
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
