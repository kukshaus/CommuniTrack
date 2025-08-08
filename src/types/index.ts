export interface Entry {
  _id?: string;
  title: string;
  date: Date;
  description: string;
  category: EntryCategory;
  attachments: Attachment[];
  tags: string[];
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Benutzer-spezifische Einträge
}

export interface Attachment {
  _id?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnail?: string;
  context?: string;
  isImportant: boolean;
  uploadedAt: Date;
}

export type EntryCategory = 
  | 'konflikt'
  | 'gespraech'
  | 'verhalten'
  | 'beweis'
  | 'kindbetreuung'
  | 'sonstiges';

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  category?: EntryCategory;
  searchTerm?: string;
  hasMedia?: boolean;
  tags?: string[];
  isImportant?: boolean;
}

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv';
  includeImages: boolean;
  passwordProtected: boolean;
  password?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}