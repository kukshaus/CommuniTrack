'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import { ExportOptions, Entry } from '@/types';
import { ExportService } from '@/lib/export';
import { formatDate } from '@/lib/utils';
import { 
  X, 
  Download, 
  FileText, 
  Database, 
  Table,
  Calendar,
  Filter,
  Lock
} from 'lucide-react';

interface ExportDialogProps {
  onClose: () => void;
}

export function ExportDialog({ onClose }: ExportDialogProps) {
  const { entries, categories } = useStore();
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeAttachments: true,
    dateRange: undefined,
    categories: undefined,
    password: undefined,
  });

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Filter entries based on options
      let filteredEntries = ExportService.filterEntriesByOptions(entries, exportOptions);
      
      switch (exportOptions.format) {
        case 'pdf':
          await ExportService.exportToPDF(filteredEntries, exportOptions);
          break;
        case 'json':
          await ExportService.exportToJSON(filteredEntries, exportOptions);
          break;
        case 'csv':
          await ExportService.exportToCSV(filteredEntries, exportOptions);
          break;
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setExporting(false);
    }
  };

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  };

  const filteredCount = ExportService.filterEntriesByOptions(entries, exportOptions).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Download className="h-5 w-5" />
            Daten exportieren
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={exporting}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Export-Format</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={exportOptions.format === 'pdf' ? 'default' : 'outline'}
                onClick={() => updateOptions({ format: 'pdf' })}
                className="flex flex-col items-center gap-2 h-auto py-3"
                disabled={exporting}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">PDF</span>
              </Button>
              <Button
                variant={exportOptions.format === 'json' ? 'default' : 'outline'}
                onClick={() => updateOptions({ format: 'json' })}
                className="flex flex-col items-center gap-2 h-auto py-3"
                disabled={exporting}
              >
                <Database className="h-5 w-5" />
                <span className="text-xs">JSON</span>
              </Button>
              <Button
                variant={exportOptions.format === 'csv' ? 'default' : 'outline'}
                onClick={() => updateOptions({ format: 'csv' })}
                className="flex flex-col items-center gap-2 h-auto py-3"
                disabled={exporting}
              >
                <Table className="h-5 w-5" />
                <span className="text-xs">CSV</span>
              </Button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Zeitraum (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Von</label>
                <Input
                  type="date"
                  value={exportOptions.dateRange?.start || ''}
                  onChange={(e) => updateOptions({
                    dateRange: e.target.value ? {
                      start: e.target.value,
                      end: exportOptions.dateRange?.end || ''
                    } : undefined
                  })}
                  disabled={exporting}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Bis</label>
                <Input
                  type="date"
                  value={exportOptions.dateRange?.end || ''}
                  onChange={(e) => updateOptions({
                    dateRange: exportOptions.dateRange?.start ? {
                      start: exportOptions.dateRange.start,
                      end: e.target.value
                    } : undefined
                  })}
                  disabled={exporting}
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Kategorien (optional)
            </label>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.categories?.includes(category.id) || false}
                    onChange={(e) => {
                      const currentCategories = exportOptions.categories || [];
                      if (e.target.checked) {
                        updateOptions({
                          categories: [...currentCategories, category.id]
                        });
                      } else {
                        updateOptions({
                          categories: currentCategories.filter(id => id !== category.id)
                        });
                      }
                    }}
                    disabled={exporting}
                    className="rounded border-input"
                  />
                  <span 
                    className="text-sm flex items-center gap-2"
                    style={{ color: category.color }}
                  >
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Optionen</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAttachments}
                  onChange={(e) => updateOptions({ includeAttachments: e.target.checked })}
                  disabled={exporting}
                  className="rounded border-input"
                />
                <span className="text-sm">Anhänge in Export einbeziehen</span>
              </label>
            </div>
          </div>

          {/* Password Protection (Future Feature) */}
          <div className="space-y-3 opacity-50">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Passwortschutz (Coming Soon)
            </label>
            <Input
              type="password"
              placeholder="Passwort für Export (optional)"
              disabled={true}
            />
          </div>

          {/* Export Summary */}
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm space-y-1">
              <p><strong>Export-Vorschau:</strong></p>
              <p>Format: {exportOptions.format.toUpperCase()}</p>
              <p>Einträge: {filteredCount} von {entries.length}</p>
              <p>Anhänge: {exportOptions.includeAttachments ? 'Ja' : 'Nein'}</p>
              {exportOptions.dateRange && (
                <p>Zeitraum: {formatDate(exportOptions.dateRange.start)} - {formatDate(exportOptions.dateRange.end)}</p>
              )}
              {exportOptions.categories && exportOptions.categories.length > 0 && (
                <p>Kategorien: {exportOptions.categories.length} ausgewählt</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={exporting || filteredCount === 0}
              className="flex-1"
            >
              {exporting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {exporting ? 'Exportiere...' : 'Export starten'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={exporting}
            >
              Abbrechen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
