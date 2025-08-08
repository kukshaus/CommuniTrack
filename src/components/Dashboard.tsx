import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Plus, Download, FileText, Settings } from 'lucide-react';
import { Entry } from '@/types';
import { useStore } from '@/store/useStore';
import Button from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';
import EntryForm from './EntryForm';
import EntryList from './EntryList';
import FilterBar from './FilterBar';
import ExportDialog from './ExportDialog';
import LoadingSpinner from './LoadingSpinner';

export interface DashboardRef {
  handleNewEntry: () => void;
  handleExport: () => void;
}

const Dashboard = forwardRef<DashboardRef>((props, ref) => {
  const { 
    entries, 
    filteredEntries, 
    isLoading, 
    setEntries, 
    setLoading,
    selectedEntry,
    setSelectedEntry,
    isModalOpen,
    setModalOpen,
    user
  } = useStore();
  
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>();

  const loadEntries = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/entries?userId=${user.id}`);
      if (response.ok) {
        const entriesData = await response.json();
        setEntries(entriesData);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  }, [setEntries, setLoading, user?.id]);

  // Load entries on component mount
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleNewEntry = () => {
    setEditingEntry(undefined);
    setShowEntryForm(true);
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  // Expose functions to parent component via ref
  useImperativeHandle(ref, () => ({
    handleNewEntry,
    handleExport,
  }));

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
  };

  const handleCloseForm = () => {
    setShowEntryForm(false);
    setEditingEntry(undefined);
  };

  const getStats = () => {
    // Use filteredEntries which are already filtered by current user
    const userEntries = filteredEntries.length > 0 ? filteredEntries : entries.filter(e => e.userId === user?.id);
    const totalEntries = userEntries.length;
    const importantEntries = userEntries.filter(e => e.isImportant).length;
    const entriesWithMedia = userEntries.filter(e => e.attachments.length > 0).length;
    const categories = new Set(userEntries.map(e => e.category)).size;
    
    return {
      totalEntries,
      importantEntries,
      entriesWithMedia,
      categories,
    };
  };

  const stats = getStats();

  if (isLoading && entries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Lade Einträge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 bg-blue-100 rounded-md">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Gesamt Einträge
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalEntries}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 bg-yellow-100 rounded-md">
                    <span className="text-yellow-600 text-lg">⭐</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Wichtige Einträge
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.importantEntries}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 bg-green-100 rounded-md">
                    <span className="text-green-600 text-lg">📷</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Mit Medien
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.entriesWithMedia}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 bg-purple-100 rounded-md">
                    <span className="text-purple-600 text-lg">📁</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Kategorien
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.categories}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar />
        </div>

        {/* Entry List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Einträge ({filteredEntries.length})
              </h2>
              {filteredEntries.length !== entries.length && (
                <span className="text-sm text-gray-500">
                  ({entries.length - filteredEntries.length} gefiltert)
                </span>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">Lade Einträge...</p>
              </div>
            ) : (
              <EntryList onEditEntry={handleEditEntry} />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showEntryForm && (
        <EntryForm
          entry={editingEntry}
          onClose={handleCloseForm}
        />
      )}

      {showExportDialog && (
        <ExportDialog
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
