'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStore } from '@/store/useStore';
import { FilterOptions } from '@/types';
import { Search, Filter, X, Calendar, Tag, Star, Paperclip } from 'lucide-react';

interface FilterBarProps {
  onFiltersChange: (filters: FilterOptions) => void;
}

export function FilterBar({ onFiltersChange }: FilterBarProps) {
  const { categories } = useStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {};
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FilterOptions];
    return value !== undefined && value !== '' && value !== false;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Einträge durchsuchen..."
          value={filters.searchTerm || ''}
          onChange={(e) => updateFilters({ searchTerm: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
              {Object.values(filters).filter(v => v !== undefined && v !== '' && v !== false).length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Filter zurücksetzen
          </Button>
        )}

        {/* Quick Filters */}
        <Button
          variant={filters.isImportant ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilters({ 
            isImportant: filters.isImportant ? undefined : true 
          })}
          className="flex items-center gap-2"
        >
          <Star className="h-4 w-4" />
          Wichtig
        </Button>

        <Button
          variant={filters.hasAttachments ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilters({ 
            hasAttachments: filters.hasAttachments ? undefined : true 
          })}
          className="flex items-center gap-2"
        >
          <Paperclip className="h-4 w-4" />
          Mit Anhängen
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/30">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Zeitraum
            </label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="Von"
                value={filters.startDate || ''}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Bis"
                value={filters.endDate || ''}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Kategorie
            </label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => updateFilters({ categoryId: e.target.value || undefined })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Alle Kategorien</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tags (kommagetrennt)
            </label>
            <Input
              placeholder="tag1, tag2, tag3"
              value={filters.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                updateFilters({ tags: tags.length > 0 ? tags : undefined });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
