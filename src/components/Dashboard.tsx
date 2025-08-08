import React, { useState, useEffect } from 'react';
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

const Dashboard: React.FC = () => {
  const { 
    entries, 
    filteredEntries, 
    isLoading, 
    setEntries, 
    setLoading,
    selectedEntry,
    setSelectedEntry,
    isModalOpen,
    setModalOpen
  } = useStore();
  
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>();

  // Load entries on component mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/entries');
      if (response.ok) {
        const entriesData = await response.json();
        setEntries(entriesData);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewEntry = () => {
    setEditingEntry(undefined);
    setShowEntryForm(true);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
  };

  const handleCloseForm = () => {
    setShowEntryForm(false);
    setEditingEntry(undefined);
  };

  const getStats = () => {
    const totalEntries = entries.length;
    const importantEntries = entries.filter(e => e.isImportant).length;
    const entriesWithMedia = entries.filter(e => e.attachments.length > 0).length;
    const categories = new Set(entries.map(e => e.category)).size;
    
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                CommuniTrack
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
                disabled={entries.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleNewEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Eintrag
              </Button>
            </div>
          </div>
        </div>
      </header>

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
};

export default Dashboard;
