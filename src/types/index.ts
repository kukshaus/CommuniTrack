export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: EntryCategory;
  date: string;
  time: string;
  important: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  entry_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  context?: string;
  created_at: string;
}

export type EntryCategory = 
  | 'konflikt'
  | 'gespraech'
  | 'verhalten'
  | 'beweis'
  | 'kindbetreuung'
  | 'sonstiges';

export interface EntryFilter {
  category?: EntryCategory;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  hasAttachments?: boolean;
  important?: boolean;
  tags?: string[];
}

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv';
  includeAttachments: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  password?: string;
}

export interface AppState {
  user: User | null;
  entries: Entry[];
  isLoading: boolean;
  error: string | null;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      entries: {
        Row: Entry;
        Insert: Omit<Entry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Entry, 'id' | 'created_at' | 'updated_at'>>;
      };
      attachments: {
        Row: Attachment;
        Insert: Omit<Attachment, 'id' | 'created_at'>;
        Update: Partial<Omit<Attachment, 'id' | 'created_at'>>;
      };
    };
  };
}