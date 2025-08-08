export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category_id?: string;
  category?: Category;
  event_date: string;
  is_important: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  entry_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  is_important: boolean;
  context?: string;
  created_at: string;
}

export interface CreateEntryData {
  title: string;
  description?: string;
  category_id?: string;
  event_date: string;
  is_important?: boolean;
  tags?: string[];
}

export interface UpdateEntryData extends Partial<CreateEntryData> {
  id: string;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  isImportant?: boolean;
  hasAttachments?: boolean;
  searchTerm?: string;
  tags?: string[];
}

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv';
  includeAttachments: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  password?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
