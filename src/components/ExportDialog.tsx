'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { generatePDF, generateJSON, generateCSV } from '@/lib/export'
import { ExportOptions } from '@/types'
import { X, FileDown, FileText, Database, Lock } from 'lucide-react'

interface ExportDialogProps {
  onClose: () => void
}

export default function ExportDialog({ onClose }: ExportDialogProps) {
  const { entries, filters } = useStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeAttachments: true,
    dateRange: undefined,
    password: undefined
  })

  // Filter entries based on current filters
  const filteredEntries = entries.filter(entry => {
    if (filters.category && entry.category !== filters.category) return false
    if (filters.dateFrom && entry.date < filters.dateFrom) return false
    if (filters.dateTo && entry.date > filters.dateTo) return false
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesTitle = entry.title.toLowerCase().includes(searchLower)
      const matchesDescription = entry.description.toLowerCase().includes(searchLower)
      const matchesTags = entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
      if (!matchesTitle && !matchesDescription && !matchesTags) return false
    }
    if (filters.important && !entry.important) return false
    if (filters.hasAttachments && (!entry.attachments || entry.attachments.length === 0)) return false
    return true
  })

  const handleExport = async () => {
    if (filteredEntries.length === 0) return

    setIsExporting(true)
    try {
      let filename: string
      let blob: Blob

      switch (exportOptions.format) {
        case 'pdf':
          filename = `CommuniTrack_Export_${new Date().toISOString().split('T')[0]}.pdf`
          blob = await generatePDF(filteredEntries, exportOptions)
          break
        case 'json':
          filename = `CommuniTrack_Export_${new Date().toISOString().split('T')[0]}.json`
          blob = generateJSON(filteredEntries, exportOptions)
          break
        case 'csv':
          filename = `CommuniTrack_Export_${new Date().toISOString().split('T')[0]}.csv`
          blob = generateCSV(filteredEntries, exportOptions)
          break
        default:
          throw new Error('Unsupported export format')
      }

      // Download the file
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onClose()
    } catch (error) {
      console.error('Export error:', error)
      alert('Fehler beim Exportieren. Bitte versuchen Sie es erneut.')
    } finally {
      setIsExporting(false)
    }
  }

  const formatIcons = {
    pdf: FileText,
    json: Database,
    csv: Database
  }

  const formatLabels = {
    pdf: 'PDF - Für Gerichte und offizielle Dokumente',
    json: 'JSON - Für Entwickler und Datensicherung',
    csv: 'CSV - Für Excel und Tabellenkalkulationen'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileDown className="h-5 w-5 mr-2" />
              Daten exportieren
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Stats */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">
              Zu exportierende Einträge:
            </div>
            <div className="text-2xl font-bold">
              {filteredEntries.length}
            </div>
            {filteredEntries.length !== entries.length && (
              <div className="text-xs text-gray-600">
                (von {entries.length} gefiltert)
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Export-Format</label>
            {(Object.keys(formatLabels) as Array<keyof typeof formatLabels>).map((format) => {
              const Icon = formatIcons[format]
              return (
                <div
                  key={format}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportOptions.format === format
                      ? 'border-blue-500 bg-blue-500/5'
                      : 'border-gray-300 hover:bg-gray-100/50'
                  }`}
                  onClick={() => setExportOptions({ ...exportOptions, format })}
                >
                  <input
                    type="radio"
                    checked={exportOptions.format === format}
                    onChange={() => setExportOptions({ ...exportOptions, format })}
                    className="h-4 w-4"
                  />
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium text-sm">
                      {format.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatLabels[format]}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Export-Optionen</label>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeAttachments"
                checked={exportOptions.includeAttachments}
                onChange={(e) => 
                  setExportOptions({ 
                    ...exportOptions, 
                    includeAttachments: e.target.checked 
                  })
                }
                className="h-4 w-4"
              />
              <label htmlFor="includeAttachments" className="text-sm">
                Anhänge einbinden
              </label>
            </div>

            {exportOptions.format === 'pdf' && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  PDF-Passwort (optional)
                </label>
                <Input
                  type="password"
                  placeholder="Passwort für PDF-Schutz"
                  value={exportOptions.password || ''}
                  onChange={(e) => 
                    setExportOptions({ 
                      ...exportOptions, 
                      password: e.target.value || undefined 
                    })
                  }
                />
                <p className="text-xs text-gray-600">
                  Lassen Sie das Feld leer für ungeschütztes PDF
                </p>
              </div>
            )}
          </div>

          {/* Date Range Override */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Zeitraum überschreiben (optional)</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Von</label>
                <Input
                  type="date"
                  value={exportOptions.dateRange?.from || ''}
                  onChange={(e) => 
                    setExportOptions({
                      ...exportOptions,
                      dateRange: {
                        from: e.target.value,
                        to: exportOptions.dateRange?.to || ''
                      }
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Bis</label>
                <Input
                  type="date"
                  value={exportOptions.dateRange?.to || ''}
                  onChange={(e) => 
                    setExportOptions({
                      ...exportOptions,
                      dateRange: {
                        from: exportOptions.dateRange?.from || '',
                        to: e.target.value
                      }
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || filteredEntries.length === 0}
            >
              {isExporting ? 'Exportiere...' : 'Exportieren'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}