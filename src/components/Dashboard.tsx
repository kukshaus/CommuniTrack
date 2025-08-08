'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EntryForm } from '@/components/EntryForm';
import { EntryList } from '@/components/EntryList';
import { FilterBar } from '@/components/FilterBar';
import { ExportDialog } from '@/components/ExportDialog';
import { FileUpload } from '@/components/FileUpload';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store/useStore';
import { FilterOptions, Entry } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  Plus, 
  LogOut, 
  Download, 
  BarChart3,
  Calendar,
  Star,
  Paperclip,
  Upload,
  User
} from 'lucide-react';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { 
    entries, 
    categories, 
    loading, 
    error, 
    fetchEntries, 
    fetchCategories 
  } = useStore();
  
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedEntryForUpload, setSelectedEntryForUpload] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Load data on mount
  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchCategories();
    }
  }, [user, fetchEntries, fetchCategories]);

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(entry => 
        entry.title.toLowerCase().includes(searchLower) ||
        (entry.description && entry.description.toLowerCase().includes(searchLower)) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Date range filter
    if (filters.startDate) {
      result = result.filter(entry => 
        new Date(entry.event_date) >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      result = result.filter(entry => 
        new Date(entry.event_date) <= new Date(filters.endDate!)
      );
    }

    // Category filter
    if (filters.categoryId) {
      result = result.filter(entry => entry.category_id === filters.categoryId);
    }

    // Important filter
    if (filters.isImportant !== undefined) {
      result = result.filter(entry => entry.is_important === filters.isImportant);
    }

    // Has attachments filter
    if (filters.hasAttachments !== undefined) {
      result = result.filter(entry => 
        filters.hasAttachments ? 
        (entry.attachments && entry.attachments.length > 0) : 
        (!entry.attachments || entry.attachments.length === 0)
      );
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(entry => 
        filters.tags!.some(filterTag => 
          entry.tags.some(entryTag => 
            entryTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }

    return result;
  }, [entries, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const importantEntries = entries.filter(e => e.is_important).length;
    const entriesWithAttachments = entries.filter(e => e.attachments && e.attachments.length > 0).length;
    const recentEntries = entries.filter(e => {
      const entryDate = new Date(e.event_date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return entryDate >= sevenDaysAgo;
    }).length;

    return {
      total: totalEntries,
      important: importantEntries,
      withAttachments: entriesWithAttachments,
      recent: recentEntries,
    };
  }, [entries]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFileUploadComplete = () => {
    setShowFileUpload(false);
    setSelectedEntryForUpload(null);
    fetchEntries(); // Refresh entries to show new attachments
  };

  if (loading && entries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">CommuniTrack</h1>
              <div className="text-sm text-muted-foreground">
                📝 Private Dokumentation
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user?.email}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wichtig</p>
                  <p className="text-2xl font-semibold">{stats.important}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Paperclip className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mit Anhängen</p>
                  <p className="text-2xl font-semibold">{stats.withAttachments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diese Woche</p>
                  <p className="text-2xl font-semibold">{stats.recent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => setShowEntryForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Neuer Eintrag
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2"
            disabled={entries.length === 0}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowFileUpload(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Dateien hochladen
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar onFiltersChange={setFilters} />
        </div>

        {/* Results Count */}
        {Object.keys(filters).length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredEntries.length} von {entries.length} Einträgen{' '}
            {filteredEntries.length !== entries.length && 'werden angezeigt'}
          </div>
        )}

        {/* Entry List */}
        <EntryList entries={filteredEntries} />
      </main>

      {/* Dialogs */}
      {showEntryForm && (
        <EntryForm
          onClose={() => setShowEntryForm(false)}
        />
      )}

      {showExportDialog && (
        <ExportDialog
          onClose={() => setShowExportDialog(false)}
        />
      )}

      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl">Dateien hochladen</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowFileUpload(false);
                  setSelectedEntryForUpload(null);
                }}
              >
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Wählen Sie einen Eintrag aus, zu dem Sie Dateien hinzufügen möchten:
                </p>
                
                <select
                  value={selectedEntryForUpload || ''}
                  onChange={(e) => setSelectedEntryForUpload(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Eintrag auswählen...</option>
                  {entries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {formatDate(entry.event_date)} - {entry.title}
                    </option>
                  ))}
                </select>

                {selectedEntryForUpload && (
                  <FileUpload
                    entryId={selectedEntryForUpload}
                    onUploadComplete={handleFileUploadComplete}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
