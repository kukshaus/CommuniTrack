import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Plus, Download, FileText, Settings, Star, Camera, FolderOpen, Upload, Trash2 } from 'lucide-react';
import { Entry } from '@/types';
import { useStore } from '@/store/useStore';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';
import EntryForm from './EntryForm';
import EntryList from './EntryList';
import FilterBar from './FilterBar';
import ExportDialog from './ExportDialog';
import ImportDialog from './ImportDialog';
import BulkDeleteDialog from './BulkDeleteDialog';
import LoadingSpinner from './LoadingSpinner';
import SlideOver from './ui/SlideOver';
import UserSettings from './UserSettings';

export interface DashboardRef {
  handleNewEntry: () => void;
  handleExport: () => void;
  handleImport: () => void;
  handleBulkDelete: () => void;
  handleOpenSettings: () => void;
}

const Dashboard = forwardRef<DashboardRef>((props, ref) => {
  const { t } = useLanguage();
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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  const handleImport = () => {
    setShowImportDialog(true);
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  // Expose functions to parent component via ref
  useImperativeHandle(ref, () => ({
    handleNewEntry,
    handleExport,
    handleImport,
    handleBulkDelete,
    handleOpenSettings,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex justify-between items-start mb-12">
          <div className="animate-slide-up">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              {t('dashboard.title')}
            </h2>
            <p className="text-gray-600 mt-2 text-lg">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3 animate-slide-up">
            <Button
              variant="outline"
              onClick={handleBulkDelete}
              disabled={entries.length === 0}
              className="flex items-center shadow-sm hover:shadow-md transition-all duration-200 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Bulk-Löschung
            </Button>
            <Button
              variant="outline"
              onClick={handleImport}
              className="flex items-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={entries.length === 0}
              className="flex items-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('dashboard.export')}
            </Button>
            <Button
              onClick={handleNewEntry}
              className="flex items-center shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.newEntry')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card hover className="animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t('dashboard.stats.total')}
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {stats.totalEntries}
                  </p>
                </div>
                <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover className="animate-slide-up [animation-delay:0.1s]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t('dashboard.stats.important')}
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    {stats.importantEntries}
                  </p>
                </div>
                <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
                  <Star className="h-6 w-6 text-white fill-current" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover className="animate-slide-up [animation-delay:0.2s]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t('dashboard.stats.attachments')}
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    {stats.entriesWithMedia}
                  </p>
                </div>
                <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover className="animate-slide-up [animation-delay:0.3s]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t('dashboard.stats.categories')}
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    {stats.categories}
                  </p>
                </div>
                <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <FolderOpen className="h-6 w-6 text-white" />
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

      {/* Slide-overs */}
      {showEntryForm && (
        <SlideOver
          isOpen={showEntryForm}
          onClose={handleCloseForm}
          title={editingEntry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
          side="right"
          size="xl"
        >
          <EntryForm
            entry={editingEntry}
            onClose={handleCloseForm}
          />
        </SlideOver>
      )}

      {showExportDialog && (
        <SlideOver
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          title="Export"
          side="right"
          size="lg"
        >
          <ExportDialog
            onClose={() => setShowExportDialog(false)}
          />
        </SlideOver>
      )}

      {showImportDialog && (
        <SlideOver
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          title="Daten Import"
          side="right"
          size="xl"
        >
          <ImportDialog
            onClose={() => setShowImportDialog(false)}
          />
        </SlideOver>
      )}

      {showBulkDeleteDialog && (
        <SlideOver
          isOpen={showBulkDeleteDialog}
          onClose={() => setShowBulkDeleteDialog(false)}
          title="Bulk-Löschung"
          side="right"
          size="xl"
        >
          <BulkDeleteDialog
            onClose={() => setShowBulkDeleteDialog(false)}
          />
        </SlideOver>
      )}

      {showSettings && (
        <SlideOver
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title="Einstellungen"
          side="right"
          size="lg"
        >
          <UserSettings
            onClose={() => setShowSettings(false)}
          />
        </SlideOver>
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
