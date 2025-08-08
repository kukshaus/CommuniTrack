'use client';

import { useState } from 'react';
import { Entry } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EntryForm } from '@/components/EntryForm';
import { useStore } from '@/store/useStore';
import { formatDate, getFileTypeIcon } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  Tag, 
  Star, 
  Edit, 
  Trash2, 
  Paperclip,
  Download,
  Eye
} from 'lucide-react';

interface EntryListProps {
  entries: Entry[];
}

export function EntryList({ entries }: EntryListProps) {
  const { deleteEntry, deleteAttachment } = useStore();
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const handleDelete = async (entry: Entry) => {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;
    
    try {
      setDeletingId(entry.id);
      await deleteEntry(entry.id);
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAttachment = async (attachment: any, entry: Entry) => {
    if (!confirm('Möchten Sie diese Datei wirklich löschen?')) return;
    
    try {
      await deleteAttachment(attachment.id, attachment.file_path);
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const downloadAttachment = async (attachment: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  const getAttachmentUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Noch keine Einträge</p>
          <p>Erstellen Sie Ihren ersten Eintrag, um zu beginnen.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {entries.map((entry) => {
          const isExpanded = expandedEntries.has(entry.id);
          const hasLongDescription = entry.description && entry.description.length > 200;
          const displayDescription = hasLongDescription && !isExpanded 
            ? entry.description.slice(0, 200) + '...'
            : entry.description;

          return (
            <Card key={entry.id} className="animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{entry.title}</h3>
                      {entry.is_important && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(entry.event_date)}
                      </span>
                      
                      {entry.category && (
                        <span 
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${entry.category.color}20`,
                            color: entry.category.color 
                          }}
                        >
                          <Tag className="h-3 w-3" />
                          {entry.category.name}
                        </span>
                      )}

                      {entry.attachments && entry.attachments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-4 w-4" />
                          {entry.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingEntry(entry)}
                      disabled={deletingId === entry.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry)}
                      disabled={deletingId === entry.id}
                    >
                      {deletingId === entry.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {entry.description && (
                  <div className="mb-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {displayDescription}
                    </p>
                    {hasLongDescription && (
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="text-primary text-sm hover:underline mt-1"
                      >
                        {isExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                      </button>
                    )}
                  </div>
                )}

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {entry.attachments && entry.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Anhänge</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {entry.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 border rounded-md bg-muted/30"
                        >
                          <span className="text-lg">
                            {getFileTypeIcon(attachment.file_type || '')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {attachment.file_name}
                            </p>
                            {attachment.context && (
                              <p className="text-xs text-muted-foreground truncate">
                                {attachment.context}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {attachment.file_type?.startsWith('image/') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(getAttachmentUrl(attachment.file_path), '_blank')}
                                className="h-6 w-6"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadAttachment(attachment)}
                              className="h-6 w-6"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAttachment(attachment, entry)}
                              className="h-6 w-6"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingEntry && (
        <EntryForm
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  );
}
