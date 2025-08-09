import React, { useState, useMemo } from 'react';
import { Trash2, AlertTriangle, Filter, CheckCircle, XCircle, Search } from 'lucide-react';
import { Entry, FilterOptions, EntryCategory } from '@/types';
import { useStore } from '@/store/useStore';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardHeader, CardContent } from './ui/Card';

interface BulkDeleteDialogProps {
  onClose: () => void;
}

const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { entries, user, deleteEntry, setLoading } = useStore();
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [deleteFilters, setDeleteFilters] = useState<FilterOptions>({});
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  // Filter entries based on user and delete filters
  const userEntries = useMemo(() => {
    return entries.filter(entry => entry.userId === user?.id);
  }, [entries, user?.id]);

  const filteredEntriesForDeletion = useMemo(() => {
    let filtered = [...userEntries];

    // Apply delete filters
    if (deleteFilters.startDate) {
      filtered = filtered.filter(entry => 
        new Date(entry.date) >= deleteFilters.startDate!
      );
    }
    if (deleteFilters.endDate) {
      filtered = filtered.filter(entry => 
        new Date(entry.date) <= deleteFilters.endDate!
      );
    }
    if (deleteFilters.category) {
      filtered = filtered.filter(entry => entry.category === deleteFilters.category);
    }
    if (deleteFilters.searchTerm) {
      const searchLower = deleteFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        (entry.initiator && entry.initiator.toLowerCase().includes(searchLower))
      );
    }
    if (deleteFilters.hasMedia !== undefined) {
      filtered = filtered.filter(entry =>
        deleteFilters.hasMedia ? entry.attachments.length > 0 : entry.attachments.length === 0
      );
    }
    if (deleteFilters.isImportant !== undefined) {
      filtered = filtered.filter(entry => entry.isImportant === deleteFilters.isImportant);
    }
    if (deleteFilters.tags && deleteFilters.tags.length > 0) {
      filtered = filtered.filter(entry =>
        deleteFilters.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    return filtered;
  }, [userEntries, deleteFilters]);

  const selectedEntriesData = useMemo(() => {
    return filteredEntriesForDeletion.filter(entry => selectedEntries.has(entry._id!));
  }, [filteredEntriesForDeletion, selectedEntries]);

  const handleSelectAll = () => {
    if (selectedEntries.size === filteredEntriesForDeletion.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredEntriesForDeletion.map(entry => entry._id!)));
    }
  };

  const handleSelectEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const handleBulkDelete = async () => {
    if (confirmationText !== 'LÖSCHEN' || selectedEntries.size === 0 || !user) return;

    setIsDeleting(true);
    let successCount = 0;

    try {
      for (const entryId of Array.from(selectedEntries)) {
        try {
          const response = await fetch(`/api/entries/${entryId}?userId=${user.id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            deleteEntry(entryId);
            successCount++;
          }
        } catch (error) {
          console.error(`Error deleting entry ${entryId}:`, error);
        }
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
    }

    setDeletedCount(successCount);
    setIsDeleting(false);
    setDeleteComplete(true);
  };

  const categories: { value: EntryCategory; label: string }[] = [
    { value: 'konflikt', label: 'Konflikt' },
    { value: 'gespraech', label: 'Gespräch' },
    { value: 'verhalten', label: 'Verhalten' },
    { value: 'beweis', label: 'Beweis' },
    { value: 'kindbetreuung', label: 'Kindbetreuung' },
    { value: 'sonstiges', label: 'Sonstiges' },
  ];

  if (deleteComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Löschung abgeschlossen
            </h3>
            <p className="text-gray-600 mb-6">
              {deletedCount} von {selectedEntries.size} Einträgen wurden erfolgreich gelöscht.
            </p>
            <Button onClick={onClose} className="w-full">
              Schließen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Trash2 className="h-6 w-6 mr-2 text-red-600" />
            Bulk-Löschung
          </h2>
          <p className="text-gray-600 mt-1">
            Wähle Einträge nach Filtern aus und lösche mehrere gleichzeitig
          </p>
        </div>
      </div>

      {/* Warning */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium text-amber-800 mb-1">Achtung!</p>
              <p>Diese Aktion kann nicht rückgängig gemacht werden. Gelöschte Einträge sind unwiderruflich verloren.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter für Auswahl
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Von Datum
              </label>
              <input
                type="date"
                value={deleteFilters.startDate ? deleteFilters.startDate.toISOString().slice(0, 10) : ''}
                onChange={(e) => setDeleteFilters(prev => ({ 
                  ...prev, 
                  startDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bis Datum
              </label>
              <input
                type="date"
                value={deleteFilters.endDate ? deleteFilters.endDate.toISOString().slice(0, 10) : ''}
                onChange={(e) => setDeleteFilters(prev => ({ 
                  ...prev, 
                  endDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie
              </label>
              <select
                value={deleteFilters.category || ''}
                onChange={(e) => setDeleteFilters(prev => ({ 
                  ...prev, 
                  category: e.target.value as EntryCategory || undefined 
                }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Alle Kategorien</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Important */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wichtigkeit
              </label>
              <select
                value={deleteFilters.isImportant === undefined ? '' : deleteFilters.isImportant.toString()}
                onChange={(e) => setDeleteFilters(prev => ({ 
                  ...prev, 
                  isImportant: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Alle</option>
                <option value="true">Nur wichtige</option>
                <option value="false">Nur unwichtige</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <Input
            label="Suchbegriff"
            value={deleteFilters.searchTerm || ''}
            onChange={(e) => setDeleteFilters(prev => ({ ...prev, searchTerm: e.target.value || undefined }))}
            placeholder="Suche in Titel, Beschreibung, Tags, Initiator..."
            icon={<Search className="h-4 w-4" />}
          />

          {/* Media Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anhänge
            </label>
            <select
              value={deleteFilters.hasMedia === undefined ? '' : deleteFilters.hasMedia.toString()}
              onChange={(e) => setDeleteFilters(prev => ({ 
                ...prev, 
                hasMedia: e.target.value === '' ? undefined : e.target.value === 'true'
              }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Alle</option>
              <option value="true">Mit Anhängen</option>
              <option value="false">Ohne Anhänge</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Gefilterte Einträge ({filteredEntriesForDeletion.length})
            </h3>
            {filteredEntriesForDeletion.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedEntries.size === filteredEntriesForDeletion.length ? 'Alle abwählen' : 'Alle auswählen'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredEntriesForDeletion.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Keine Einträge entsprechen den aktuellen Filtern.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEntriesForDeletion.map(entry => (
                <div
                  key={entry._id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    selectedEntries.has(entry._id!) 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEntries.has(entry._id!)}
                    onChange={() => handleSelectEntry(entry._id!)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entry.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {entry.isImportant && (
                          <div className="flex items-center text-amber-600">
                            <span className="text-xs">Wichtig</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {entry.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {entry.category}
                      </span>
                      {entry.attachments.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {entry.attachments.length} Anhang(e)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation */}
      {selectedEntries.size > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Bestätigung erforderlich
                  </h4>
                  <p className="text-gray-600">
                    Du möchtest {selectedEntries.size} Eintrag(e) unwiderruflich löschen.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gib &quot;LÖSCHEN&quot; ein, um die Löschung zu bestätigen:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="LÖSCHEN"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Abbrechen
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  disabled={confirmationText !== 'LÖSCHEN' || isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                >
                  {isDeleting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Lösche...' : `${selectedEntries.size} Einträge löschen`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkDeleteDialog;
