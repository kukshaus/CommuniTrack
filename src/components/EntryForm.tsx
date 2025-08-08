'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getCategoryLabel, formatDate, formatTime, isValidImageType, sanitizeFilename } from '@/lib/utils'
import { EntryCategory } from '@/types'
import { X, Upload, Image as ImageIcon, Star, Calendar, Clock, Tag } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const entrySchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  category: z.enum(['konflikt', 'gespraech', 'verhalten', 'beweis', 'kindbetreuung', 'sonstiges']),
  date: z.string().min(1, 'Datum ist erforderlich'),
  time: z.string().min(1, 'Uhrzeit ist erforderlich'),
  important: z.boolean(),
  tags: z.string().optional()
})

type EntryFormData = z.infer<typeof entrySchema>

interface EntryFormProps {
  onClose: () => void
  onSuccess: () => void
  entry?: any // For editing existing entries
}

export default function EntryForm({ onClose, onSuccess, entry }: EntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: entry?.title || '',
      description: entry?.description || '',
      category: entry?.category || 'sonstiges',
      date: entry?.date || new Date().toISOString().split('T')[0],
      time: entry?.time || new Date().toTimeString().slice(0, 5),
      important: entry?.important || false,
      tags: entry?.tags?.join(', ') || ''
    }
  })

  const categories: EntryCategory[] = [
    'konflikt', 'gespraech', 'verhalten', 'beweis', 'kindbetreuung', 'sonstiges'
  ]

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter(file => 
      isValidImageType(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
    )

    setAttachments(prev => [...prev, ...validFiles])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          setAttachments(prev => [...prev, file])
        }
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const uploadAttachments = async (entryId: string) => {
    const uploadPromises = attachments.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${entryId}_${index}.${fileExt}`
      const filePath = `${user!.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase
        .from('attachments')
        .insert({
          entry_id: entryId,
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type
        })

      if (dbError) throw dbError
    })

    await Promise.all(uploadPromises)
  }

  const onSubmit = async (data: EntryFormData) => {
    if (!user) return

    try {
      setIsSubmitting(true)

      const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []

      const entryData = {
        user_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        time: data.time,
        important: data.important,
        tags
      }

      let entryId: string

      if (entry) {
        // Update existing entry
        const { error } = await supabase
          .from('entries')
          .update(entryData)
          .eq('id', entry.id)

        if (error) throw error
        entryId = entry.id
      } else {
        // Create new entry
        const { data: newEntry, error } = await supabase
          .from('entries')
          .insert(entryData)
          .select()
          .single()

        if (error) throw error
        entryId = newEntry.id
      }

      // Upload attachments if any
      if (attachments.length > 0) {
        await uploadAttachments(entryId)
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {entry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Titel
              </label>
              <Input
                {...register('title')}
                placeholder="Kurze Beschreibung des Ereignisses"
                onPaste={handlePaste}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Datum
                </label>
                <Input
                  type="date"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Uhrzeit
                </label>
                <Input
                  type="time"
                  {...register('time')}
                />
                {errors.time && (
                  <p className="text-sm text-destructive">{errors.time.message}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategorie</label>
              <select
                {...register('category')}
                className="w-full p-2 border rounded-md bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Beschreibung</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full p-2 border rounded-md bg-white resize-none"
                placeholder="Detaillierte Beschreibung des Ereignisses..."
                onPaste={handlePaste}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (optional)</label>
              <Input
                {...register('tags')}
                placeholder="Tag1, Tag2, Tag3"
              />
              <p className="text-xs text-gray-600">
                Trennen Sie Tags mit Kommas
              </p>
            </div>

            {/* Important Flag */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="important"
                {...register('important')}
                className="h-4 w-4"
              />
              <label htmlFor="important" className="text-sm font-medium flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Als wichtig markieren
              </label>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center">
                <ImageIcon className="h-4 w-4 mr-2" />
                Anhänge
              </label>
              
              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm text-gray-600 mb-2">
                  Bilder hier ablegen oder einfügen (Strg+V)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Dateien auswählen
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>

              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ausgewählte Dateien:</p>
                  <div className="space-y-1">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Wird gespeichert...' : (entry ? 'Aktualisieren' : 'Erstellen')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}