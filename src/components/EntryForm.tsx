import React, { useState, useCallback } from 'react';
import { X, Save, Tag, Calendar, FileText } from 'lucide-react';
import { Entry, EntryCategory, Attachment } from '@/types';
import { useStore } from '@/store/useStore';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardHeader, CardContent } from './ui/Card';
import FileUpload from './FileUpload';
import DraggableAttachmentList from './DraggableAttachmentList';
import DraggableFileList from './DraggableFileList';
import { formatDate } from '@/lib/utils';

interface EntryFormProps {
  entry?: Entry;
  onClose: () => void;
}

const CATEGORIES: { value: EntryCategory; label: string }[] = [
  { value: 'konflikt', label: 'Konflikt' },
  { value: 'gespraech', label: 'Gespräch' },
  { value: 'verhalten', label: 'Verhalten' },
  { value: 'beweis', label: 'Beweis' },
  { value: 'kindbetreuung', label: 'Kindbetreuung' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

const EntryForm: React.FC<EntryFormProps> = ({ entry, onClose }) => {
  const { addEntry, updateEntry, setLoading, user } = useStore();
  
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    date: entry?.date ? new Date(entry.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    description: entry?.description || '',
    category: entry?.category || 'sonstiges' as EntryCategory,
    tags: entry?.tags?.join(', ') || '',
    isImportant: entry?.isImportant || false,
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(entry?.attachments || []);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Beschreibung ist erforderlich';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    // In a real app, this would upload to a file storage service
    // For now, we'll use data URLs
    const uploadPromises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }
    
    setIsSaving(true);
    setLoading(true);
    
    try {
      // Upload files
      const uploadedUrls = await uploadFiles(files);
      
      const attachments = uploadedUrls.map((url, index) => ({
        fileName: files[index].name,
        fileType: files[index].type,
        fileSize: files[index].size,
        url,
        isImportant: false,
        uploadedAt: new Date(),
      }));

      const entryData: Entry = {
        title: formData.title.trim(),
        date: new Date(formData.date),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        isImportant: formData.isImportant,
        attachments: [...existingAttachments, ...attachments],
        createdAt: entry?.createdAt || new Date(),
        updatedAt: new Date(),
        userId: user.id, // Assign entry to current user
      };

      if (entry?._id) {
        // Update existing entry
        const response = await fetch(`/api/entries/${entry._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData),
        });
        
        if (response.ok) {
          const updatedEntry = await response.json();
          updateEntry(entry._id, updatedEntry);
        }
      } else {
        // Create new entry
        const response = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData),
        });
        
        if (response.ok) {
          const newEntry = await response.json();
          addEntry(newEntry);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const handleFilesAdd = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileRemove = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleExistingAttachmentRemove = useCallback((index: number) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleExistingAttachmentsReorder = useCallback((reorderedAttachments: Attachment[]) => {
    setExistingAttachments(reorderedAttachments);
  }, []);

  const handleFilesReorder = useCallback((reorderedFiles: File[]) => {
    setFiles(reorderedFiles);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {entry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Titel"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              error={errors.title}
              placeholder="Kurzer aussagekräftiger Titel..."
              icon={<FileText className="h-4 w-4" />}
              required
            />

            {/* Date and Time */}
            <Input
              label="Datum und Uhrzeit"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              icon={<Calendar className="h-4 w-4" />}
            />

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as EntryCategory }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Detaillierte Beschreibung des Ereignisses..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Tags */}
            <Input
              label="Tags (komma-getrennt)"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="wichtig, dringend, konflikt..."
              icon={<Tag className="h-4 w-4" />}
            />

            {/* Important */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="important"
                checked={formData.isImportant}
                onChange={(e) => setFormData(prev => ({ ...prev, isImportant: e.target.checked }))}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="important" className="ml-2 text-sm text-gray-700">
                Als wichtig markieren
              </label>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Anhänge
              </label>
              
              {/* Existing Attachments with Drag & Drop */}
              <DraggableAttachmentList
                attachments={existingAttachments}
                onReorder={handleExistingAttachmentsReorder}
                onRemove={handleExistingAttachmentRemove}
                title="Vorhandene Anhänge"
              />
              
              {/* New Files with Drag & Drop */}
              <DraggableFileList
                files={files}
                onReorder={handleFilesReorder}
                onRemove={handleFileRemove}
                title="Neue Dateien"
              />
              
              {/* File Upload Area */}
              <FileUpload
                files={[]} // Don't show files here anymore, they're shown above
                onFilesAdd={handleFilesAdd}
                onFileRemove={() => {}} // Not used since files are shown above
              />
              
              {/* Helper Text */}
              {(existingAttachments.length > 0 || files.length > 0) && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tipp: Ziehen Sie die Anhänge mit dem ⋮⋮ Symbol, um die Reihenfolge zu ändern
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Speichere...' : 'Speichern'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};



export default EntryForm;
