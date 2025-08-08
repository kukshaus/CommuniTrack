'use client'

import { useStore } from '@/store/useStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getCategoryLabel } from '@/lib/utils'
import { EntryCategory } from '@/types'
import { Search, Filter, X, Calendar, Image as ImageIcon, Star } from 'lucide-react'

export default function FilterBar() {
  const { filters, setFilters, clearFilters } = useStore()

  const categories: EntryCategory[] = [
    'konflikt', 'gespraech', 'verhalten', 'beweis', 'kindbetreuung', 'sonstiges'
  ]

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, searchTerm: value })
  }

  const handleCategoryChange = (category: EntryCategory | '') => {
    setFilters({ 
      ...filters, 
      category: category || undefined 
    })
  }

  const handleDateFromChange = (dateFrom: string) => {
    setFilters({ ...filters, dateFrom })
  }

  const handleDateToChange = (dateTo: string) => {
    setFilters({ ...filters, dateTo })
  }

  const toggleImportant = () => {
    setFilters({ 
      ...filters, 
      important: filters.important ? undefined : true 
    })
  }

  const toggleHasAttachments = () => {
    setFilters({ 
      ...filters, 
      hasAttachments: filters.hasAttachments ? undefined : true 
    })
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof typeof filters]
    return value !== undefined && value !== ''
  })

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
        <Input
          placeholder="Suchen in Titel, Beschreibung und Tags..."
          value={filters.searchTerm || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Filter:</span>
        </div>

        {/* Category Filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => handleCategoryChange(e.target.value as EntryCategory | '')}
          className="text-sm px-3 py-1 border rounded-md bg-white"
        >
          <option value="">Alle Kategorien</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {getCategoryLabel(category)}
            </option>
          ))}
        </select>

        {/* Date Range */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <Input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="w-auto text-sm"
            placeholder="Von"
          />
          <span className="text-sm text-gray-600">bis</span>
          <Input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="w-auto text-sm"
            placeholder="Bis"
          />
        </div>

        {/* Quick Filters */}
        <Button
          variant={filters.important ? "default" : "outline"}
          size="sm"
          onClick={toggleImportant}
          className="text-sm"
        >
          <Star className="h-4 w-4 mr-1" />
          Wichtig
        </Button>

        <Button
          variant={filters.hasAttachments ? "default" : "outline"}
          size="sm"
          onClick={toggleHasAttachments}
          className="text-sm"
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          Mit Anhängen
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Filter löschen
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
                     {filters.searchTerm && (
             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
               Suche: &quot;{filters.searchTerm}&quot;
             </span>
           )}
          {filters.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
              {getCategoryLabel(filters.category)}
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
              Ab: {filters.dateFrom}
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
              Bis: {filters.dateTo}
            </span>
          )}
          {filters.important && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
              Nur wichtige
            </span>
          )}
          {filters.hasAttachments && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
              Mit Anhängen
            </span>
          )}
        </div>
      )}
    </div>
  )
}