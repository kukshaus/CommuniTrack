import React, { useState } from 'react';
import { Search, Filter, X, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { FilterOptions, EntryCategory } from '@/types';
import { useStore } from '@/store/useStore';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardContent } from './ui/Card';

const CATEGORIES: { value: EntryCategory; label: string }[] = [
  { value: 'konflikt', label: 'Konflikt' },
  { value: 'gespraech', label: 'Gespräch' },
  { value: 'verhalten', label: 'Verhalten' },
  { value: 'beweis', label: 'Beweis' },
  { value: 'kindbetreuung', label: 'Kindbetreuung' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

const FilterBar: React.FC = () => {
  const { filters, setFilters, entries } = useStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleApplyFilters = () => {
    setFilters(localFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters: FilterOptions = {};
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FilterOptions];
    return value !== undefined && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  // Get all unique tags from entries
  const allTags = Array.from(
    new Set(entries.flatMap(entry => entry.tags))
  ).sort();

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Durchsuche Titel, Beschreibung oder Tags..."
            value={localFilters.searchTerm || ''}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <span className="ml-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs rounded-full px-2.5 py-0.5 shadow-sm">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
          <Button onClick={handleApplyFilters}>
            Anwenden
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Von Datum
                </label>
                <input
                  type="date"
                  value={localFilters.startDate ? localFilters.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    startDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bis Datum
                </label>
                <input
                  type="date"
                  value={localFilters.endDate ? localFilters.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    endDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <select
                  value={localFilters.category || ''}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    category: e.target.value as EntryCategory || undefined 
                  }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Alle Kategorien</option>
                  {CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Has Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medien
                </label>
                <select
                  value={localFilters.hasMedia === undefined ? '' : localFilters.hasMedia.toString()}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    hasMedia: e.target.value === '' ? undefined : e.target.value === 'true'
                  }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Alle</option>
                  <option value="true">Mit Medien</option>
                  <option value="false">Ohne Medien</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const currentTags = localFilters.tags || [];
                        const newTags = currentTags.includes(tag)
                          ? currentTags.filter(t => t !== tag)
                          : [...currentTags, tag];
                        setLocalFilters(prev => ({ ...prev, tags: newTags }));
                      }}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        localFilters.tags?.includes(tag)
                          ? 'bg-primary-100 text-primary-800 border border-primary-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Important Only */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="important-filter"
                checked={localFilters.isImportant || false}
                onChange={(e) => setLocalFilters(prev => ({ 
                  ...prev, 
                  isImportant: e.target.checked || undefined 
                }))}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="important-filter" className="ml-2 text-sm text-gray-700">
                Nur wichtige Einträge anzeigen
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleResetFilters}>
                <X className="h-4 w-4 mr-2" />
                Zurücksetzen
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAdvanced(false)}>
                  Schließen
                </Button>
                <Button onClick={handleApplyFilters}>
                  Filter anwenden
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Aktive Filter:</span>
          
          {filters.searchTerm && (
            <FilterChip
              label={`"${filters.searchTerm}"`}
              onRemove={() => setFilters({ ...filters, searchTerm: undefined })}
            />
          )}
          
          {filters.category && (
            <FilterChip
              label={CATEGORIES.find(c => c.value === filters.category)?.label || filters.category}
              onRemove={() => setFilters({ ...filters, category: undefined })}
            />
          )}
          
          {filters.hasMedia !== undefined && (
            <FilterChip
              label={filters.hasMedia ? 'Mit Medien' : 'Ohne Medien'}
              onRemove={() => setFilters({ ...filters, hasMedia: undefined })}
            />
          )}
          
          {filters.isImportant && (
            <FilterChip
              label="Wichtig"
              onRemove={() => setFilters({ ...filters, isImportant: undefined })}
            />
          )}
          
          {filters.tags?.map(tag => (
            <FilterChip
              key={tag}
              label={`#${tag}`}
              onRemove={() => setFilters({ 
                ...filters, 
                tags: filters.tags?.filter(t => t !== tag) 
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => (
  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary-100 text-primary-800 text-sm">
    {label}
    <button
      onClick={onRemove}
      className="ml-1 hover:text-primary-600"
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);

export default FilterBar;
