import React, { useState } from 'react';
import { Download, X, FileText, Database, Table, Lock } from 'lucide-react';
import { ExportOptions } from '@/types';
import { useStore } from '@/store/useStore';
import { exportToPDF, exportToJSON, exportToCSV, downloadFile } from '@/lib/export';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardHeader, CardContent } from './ui/Card';
import LoadingSpinner from './LoadingSpinner';

interface ExportDialogProps {
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ onClose }) => {
  const { filteredEntries } = useStore();
  
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeImages: true,
    passwordProtected: false,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportOptions: ExportOptions = {
        ...options,
        dateRange: dateRange.start && dateRange.end ? {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end),
        } : undefined,
      };

      // Filter entries by date range if specified
      let entriesToExport = filteredEntries;
      if (exportOptions.dateRange) {
        entriesToExport = filteredEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= exportOptions.dateRange!.start && 
                 entryDate <= exportOptions.dateRange!.end;
        });
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      
      switch (options.format) {
        case 'pdf':
          const pdfBlob = await exportToPDF(entriesToExport, exportOptions);
          downloadFile(pdfBlob, `CommuniTrack_Export_${timestamp}.html`, 'text/html');
          break;
          
        case 'json':
          const jsonContent = exportToJSON(entriesToExport, exportOptions);
          downloadFile(jsonContent, `CommuniTrack_Export_${timestamp}.json`, 'application/json');
          break;
          
        case 'csv':
          const csvContent = exportToCSV(entriesToExport, exportOptions);
          downloadFile(csvContent, `CommuniTrack_Export_${timestamp}.csv`, 'text/csv');
          break;
      }
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Exportieren. Bitte versuchen Sie es erneut.');
    } finally {
      setIsExporting(false);
    }
  };

  const getEntryCount = () => {
    if (!dateRange.start || !dateRange.end) {
      return filteredEntries.length;
    }
    
    return filteredEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(dateRange.start) && 
             entryDate <= new Date(dateRange.end);
    }).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Exportformat
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={options.format === 'pdf'}
                  onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <div className="ml-3 flex items-center">
                  <FileText className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    HTML (druckbar, empfohlen für rechtliche Zwecke)
                  </span>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={options.format === 'json'}
                  onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <div className="ml-3 flex items-center">
                  <Database className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    JSON (vollständige Daten)
                  </span>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={options.format === 'csv'}
                  onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <div className="ml-3 flex items-center">
                  <Table className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    CSV (für Excel/Tabellen)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Zeitraum (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                placeholder="Von"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                placeholder="Bis"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeImages}
                onChange={(e) => setOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Bilder und Anhänge einschließen
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.passwordProtected}
                onChange={(e) => setOptions(prev => ({ ...prev, passwordProtected: e.target.checked }))}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Passwortschutz (bald verfügbar)
              </span>
            </label>
          </div>

          {/* Password Field */}
          {options.passwordProtected && (
            <Input
              type="password"
              label="Passwort"
              value={options.password || ''}
              onChange={(e) => setOptions(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Passwort für den Export"
              icon={<Lock className="h-4 w-4" />}
            />
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Export-Zusammenfassung
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Format: {options.format.toUpperCase()}</p>
              <p>Einträge: {getEntryCount()}</p>
              <p>Bilder: {options.includeImages ? 'Enthalten' : 'Nicht enthalten'}</p>
              {dateRange.start && dateRange.end && (
                <p>Zeitraum: {dateRange.start} bis {dateRange.end}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || getEntryCount() === 0}
              className="flex items-center"
            >
              {isExporting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Exportiere...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export starten
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportDialog;
