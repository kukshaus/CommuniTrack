'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime, getCategoryLabel, getCategoryColor } from '@/lib/utils'
import { Entry } from '@/types'
import { 
  Calendar, 
  Clock, 
  Star, 
  Image as ImageIcon, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Tag as TagIcon
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import EntryForm from './EntryForm'
import Image from 'next/image'

interface EntryListProps {
  onRefresh: () => void
}

export default function EntryList({ onRefresh }: EntryListProps) {
  const { entries, filters, deleteEntry } = useStore()
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Filter by category
      if (filters.category && entry.category !== filters.category) {
        return false
      }

      // Filter by date range
      if (filters.dateFrom && entry.date < filters.dateFrom) {
        return false
      }
      if (filters.dateTo && entry.date > filters.dateTo) {
        return false
      }

      // Filter by search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesTitle = entry.title.toLowerCase().includes(searchLower)
        const matchesDescription = entry.description.toLowerCase().includes(searchLower)
        const matchesTags = entry.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        )
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false
        }
      }

      // Filter by important
      if (filters.important && !entry.important) {
        return false
      }

      // Filter by attachments
      if (filters.hasAttachments && (!entry.attachments || entry.attachments.length === 0)) {
        return false
      }

      return true
    })
  }, [entries, filters])

  const handleDelete = async (entryId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error

      deleteEntry(entryId)
      onRefresh()
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const toggleExpand = (entryId: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedEntries(newExpanded)
  }

  const getAttachmentUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath)
    return data.publicUrl
  }

  if (filteredEntries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-600">
            {entries.length === 0 ? (
              <>
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Noch keine Einträge</h3>
                <p>Erstellen Sie Ihren ersten Eintrag, um zu beginnen.</p>
              </>
            ) : (
              <>
                <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Keine Ergebnisse</h3>
                <p>Keine Einträge entsprechen den aktuellen Filtern.</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {filteredEntries.map((entry) => {
        const isExpanded = expandedEntries.has(entry.id)
        
        return (
          <Card key={entry.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{entry.title}</h3>
                    {entry.important && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                      {getCategoryLabel(entry.category)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(entry.date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(entry.time)}
                    </div>
                    {entry.attachments && entry.attachments.length > 0 && (
                      <div className="flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1" />
                        {entry.attachments.length} Anhang{entry.attachments.length !== 1 ? 'e' : ''}
                      </div>
                    )}
                  </div>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEntry(entry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(entry.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{entry.description}</p>
                  </div>

                  {entry.attachments && entry.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Anhänge:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {entry.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="relative group rounded-lg overflow-hidden border"
                          >
                            <Image
                              src={getAttachmentUrl(attachment.file_path)}
                              alt={attachment.filename}
                              width={200}
                              height={96}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-xs text-center px-2">
                                {attachment.filename}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-600">
                    Erstellt: {formatDate(entry.created_at, 'dd.MM.yyyy HH:mm')}
                    {entry.updated_at !== entry.created_at && (
                      <span className="ml-4">
                        Geändert: {formatDate(entry.updated_at, 'dd.MM.yyyy HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {editingEntry && (
        <EntryForm
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={() => {
            setEditingEntry(null)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}