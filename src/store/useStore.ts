import { create } from 'zustand';
import { Entry, Category, Attachment, FilterOptions, CreateEntryData } from '@/types';
import { supabase } from '@/lib/supabase';

interface Store {
  // State
  entries: Entry[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;

  // Actions
  setEntries: (entries: Entry[]) => void;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: FilterOptions) => void;
  
  // API Methods
  fetchEntries: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createEntry: (data: CreateEntryData) => Promise<Entry>;
  updateEntry: (id: string, data: Partial<CreateEntryData>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  uploadAttachment: (entryId: string, file: File, context?: string) => Promise<Attachment>;
  deleteAttachment: (id: string, filePath: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  // Initial state
  entries: [],
  categories: [],
  loading: false,
  error: null,
  filters: {},

  // State setters
  setEntries: (entries) => set({ entries }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),

  // API methods
  fetchEntries: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('entries')
        .select(`
          *,
          category:categories(*),
          attachments(*)
        `)
        .order('event_date', { ascending: false });

      if (error) throw error;
      
      set({ entries: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Fehler beim Laden der Einträge' });
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      set({ categories: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Fehler beim Laden der Kategorien' });
    }
  },

  createEntry: async (data: CreateEntryData) => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      const { data: entry, error } = await supabase
        .from('entries')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select(`
          *,
          category:categories(*),
          attachments(*)
        `)
        .single();

      if (error) throw error;
      
      const currentEntries = get().entries;
      set({ entries: [entry, ...currentEntries] });
      
      return entry;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Erstellen des Eintrags';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  updateEntry: async (id: string, data: Partial<CreateEntryData>) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('entries')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      // Refetch entries to get updated data
      await get().fetchEntries();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Eintrags' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteEntry: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      const currentEntries = get().entries;
      set({ entries: currentEntries.filter(entry => entry.id !== id) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Fehler beim Löschen des Eintrags' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  uploadAttachment: async (entryId: string, file: File, context?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create attachment record
      const { data: attachment, error: dbError } = await supabase
        .from('attachments')
        .insert({
          entry_id: entryId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          context,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update entries in store
      const currentEntries = get().entries;
      const updatedEntries = currentEntries.map(entry => {
        if (entry.id === entryId) {
          return {
            ...entry,
            attachments: [...(entry.attachments || []), attachment]
          };
        }
        return entry;
      });
      set({ entries: updatedEntries });

      return attachment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Hochladen der Datei';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteAttachment: async (id: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('attachments')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Update entries in store
      const currentEntries = get().entries;
      const updatedEntries = currentEntries.map(entry => ({
        ...entry,
        attachments: entry.attachments?.filter(att => att.id !== id) || []
      }));
      set({ entries: updatedEntries });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Löschen der Datei';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },
}));
