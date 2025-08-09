import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Download, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Entry, EntryCategory } from '@/types';
import { useStore } from '@/store/useStore';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';

interface ImportDialogProps {
  onClose: () => void;
}

interface ParsedRow {
  title?: string;
  date?: string;
  description?: string;
  category?: string;
  tags?: string;
  isImportant?: string | boolean;
  [key: string]: any;
}

interface ImportPreview {
  rows: ParsedRow[];
  headers: string[];
  validRows: number;
  invalidRows: number;
  errors: string[];
}

const ImportDialog: React.FC<ImportDialogProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { user, addEntry } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const validateCategory = (category: string): EntryCategory => {
    const normalizedCategory = category.toLowerCase().trim();
    const categoryMap: { [key: string]: EntryCategory } = {
      'konflikt': 'konflikt',
      'gespraech': 'gespraech',
      'gespräch': 'gespraech',
      'verhalten': 'verhalten',
      'beweis': 'beweis',
      'kindbetreuung': 'kindbetreuung',
      'sonstiges': 'sonstiges',
      'conflict': 'konflikt',
      'conversation': 'gespraech',
      'behavior': 'verhalten',
      'evidence': 'beweis',
      'childcare': 'kindbetreuung',
      'other': 'sonstiges',
    };
    
    return categoryMap[normalizedCategory] || 'sonstiges';
  };

  const validateDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    // Convert to string for processing
    const dateString = String(dateValue).trim();
    if (!dateString) return null;

    // Check if it's a number (Excel serial date)
    const numericValue = parseFloat(dateString);
    if (!isNaN(numericValue) && numericValue > 1 && numericValue < 100000) {
      // Excel serial date - convert from Excel's date system
      // Excel uses 1900-01-01 as day 1, but has a leap year bug (treats 1900 as leap year)
      const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
      const excelDate = new Date(excelEpoch.getTime() + numericValue * 24 * 60 * 60 * 1000);
      if (!isNaN(excelDate.getTime())) {
        return excelDate;
      }
    }

    // Try direct date parsing first
    const directDate = new Date(dateString);
    if (!isNaN(directDate.getTime()) && directDate.getFullYear() > 1900) {
      return directDate;
    }

    // Try parsing German format (DD.MM.YYYY)
    if (dateString.includes('.')) {
      const parts = dateString.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        
        // Handle 2-digit years
        const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
        
        const parsedDate = new Date(fullYear, month, day);
        if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900) {
          return parsedDate;
        }
      }
    }

    // Try parsing slash format (MM/DD/YYYY or DD/MM/YYYY)
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const first = parseInt(parts[0]);
        const second = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        // Handle 2-digit years
        const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
        
        // Try DD/MM/YYYY first (European format)
        if (first <= 31 && second <= 12) {
          const parsedDate = new Date(fullYear, second - 1, first);
          if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900) {
            return parsedDate;
          }
        }
        
        // Try MM/DD/YYYY (US format)
        if (first <= 12 && second <= 31) {
          const parsedDate = new Date(fullYear, first - 1, second);
          if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900) {
            return parsedDate;
          }
        }
      }
    }

    // Try parsing hyphen format (YYYY-MM-DD or DD-MM-YYYY)
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const first = parseInt(parts[0]);
        const second = parseInt(parts[1]);
        const third = parseInt(parts[2]);
        
        // Try YYYY-MM-DD (ISO format)
        if (first > 1900) {
          const parsedDate = new Date(first, second - 1, third);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
        
        // Try DD-MM-YYYY
        if (third > 1900) {
          const parsedDate = new Date(third, second - 1, first);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
    }

    return null;
  };

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const fileData = await new Promise<string | ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string | ArrayBuffer);
        reader.onerror = reject;
        
        if (file.name.endsWith('.csv')) {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      });

      let rows: any[] = [];
      let headers: string[] = [];

      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const result = Papa.parse(fileData as string, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim().toLowerCase(),
        });
        
        rows = result.data;
        headers = result.meta.fields || [];
      } else {
        // Parse Excel
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData.length > 0) {
          headers = jsonData[0].map(h => String(h).trim().toLowerCase());
          rows = jsonData.slice(1).map((row: any[]) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
        }
      }

      // Validate and process rows
      const validRows: ParsedRow[] = [];
      const errors: string[] = [];
      let validCount = 0;
      let invalidCount = 0;

      rows.forEach((row, index) => {
        const errors_row: string[] = [];
        
        // Check required fields
        if (!row.title && !row.titel) {
          errors_row.push(`Zeile ${index + 2}: Titel fehlt`);
        }
        
        if (!row.description && !row.beschreibung) {
          errors_row.push(`Zeile ${index + 2}: Beschreibung fehlt`);
        }

        // Validate date
        const dateField = row.date || row.datum;
        if (dateField && !validateDate(dateField)) {
          errors_row.push(`Zeile ${index + 2}: Ungültiges Datumsformat (${dateField})`);
        }

        if (errors_row.length > 0) {
          errors.push(...errors_row);
          invalidCount++;
        } else {
          validCount++;
          validRows.push(row);
        }
      });

      setPreview({
        rows: validRows,
        headers,
        validRows: validCount,
        invalidRows: invalidCount,
        errors,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      setPreview({
        rows: [],
        headers: [],
        validRows: 0,
        invalidRows: 0,
        errors: ['Fehler beim Verarbeiten der Datei'],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(null);
      setImportComplete(false);
      setImportResults(null);
      parseFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!preview || !user) return;

    setImporting(true);
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      for (const row of preview.rows) {
        try {
          // Map fields (support both English and German)
          const title = row.title || row.titel || '';
          const description = row.description || row.beschreibung || '';
          const categoryStr = row.category || row.kategorie || 'sonstiges';
          const tagsStr = row.tags || row.schlagworte || '';
          const importantStr = row.isimportant || row.important || row.wichtig || false;
          const dateStr = row.date || row.datum;
          const initiator = row.initiator || '';
          const mediationAttempt = row.mediation_attempt || row.schlichtungsversuch || '';
          const chatExtract = row.chat_extract || row['chat-auszug'] || '';

          // Validate and transform data
          const entry: Omit<Entry, '_id'> = {
            title: String(title).trim(),
            description: String(description).trim(),
            category: validateCategory(String(categoryStr)),
            tags: tagsStr ? String(tagsStr).split(',').map(tag => tag.trim()).filter(Boolean) : [],
            isImportant: Boolean(importantStr === 'true' || importantStr === '1' || importantStr === 'ja' || importantStr === 'yes' || importantStr === true),
            date: validateDate(dateStr) || new Date(),
            initiator: initiator ? String(initiator).trim() : undefined,
            mediationAttempt: mediationAttempt ? String(mediationAttempt).trim() : undefined,
            chatExtract: chatExtract ? String(chatExtract).trim() : undefined,
            attachments: [],
            userId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Save entry via API
          const response = await fetch('/api/entries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(entry),
          });

          if (response.ok) {
            const savedEntry = await response.json();
            addEntry(savedEntry);
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`Fehler beim Speichern: ${entry.title}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Fehler bei Eintrag: ${error}`);
        }
      }
    } catch (error) {
      results.errors.push(`Allgemeiner Importfehler: ${error}`);
    }

    setImportResults(results);
    setImporting(false);
    setImportComplete(true);
  };

  const downloadTemplate = () => {
    // Deutsche Vorlage
    const templateDE = [
      ['Datum', 'Titel', 'Beschreibung', 'Initiator', 'Schlichtungsversuch', 'Chat-Auszug', 'Kategorie', 'Schlagworte', 'Wichtig'],
      ['01.12.2024', 'Konflikt um Telefonsaft mit Philipp', 'Uneinigkeit, ob Philipp zur Kirche/Theaterbesuch oder zu Sergej soll...', 'Milla', 'Sergej schlägt vor, den Streit um Telefonsaft zu vermeiden...', 'Milla: ... er hat festgestellt, dass du nicht kommen könntest...', 'konflikt', 'telefon, streit', 'ja'],
      ['02.12.2024', 'Gespräch mit Anwalt über Unterhaltszahlungen', 'Beratung über rechtliche Schritte...', 'Sergej', 'Vorschlag einer außergerichtlichen Einigung', 'Anwalt: Die rechtlichen Möglichkeiten sind...', 'gespraech', 'anwalt, unterhalt', 'ja'],
      ['03.12.2024', 'Verhalten der Kinder beim Abholen', 'Auffälliges Verhalten beim Wechsel...', 'Milla', 'Ruhiges Gespräch über die Situation', 'Kind: Ich möchte nicht...', 'verhalten', 'kinder, abholen', 'nein'],
    ];

    // Englische Vorlage  
    const templateEN = [
      ['Date', 'Title', 'Description', 'Initiator', 'Mediation_Attempt', 'Chat_Extract', 'Category', 'Tags', 'Important'],
      ['01.12.2024', 'Conflict about phone call with Philipp', 'Disagreement whether Philipp should go to church/theater or to Sergej...', 'Milla', 'Sergej suggests avoiding the phone conflict...', 'Milla: ... he found out that you couldn\'t come...', 'conflict', 'phone, dispute', 'yes'],
      ['02.12.2024', 'Meeting with lawyer about maintenance payments', 'Legal consultation about next steps...', 'Sergej', 'Suggestion for out-of-court settlement', 'Lawyer: The legal options are...', 'conversation', 'lawyer, maintenance', 'yes'],
      ['03.12.2024', 'Children\'s behavior during pickup', 'Noticeable behavior during transition...', 'Milla', 'Calm conversation about the situation', 'Child: I don\'t want to...', 'behavior', 'children, pickup', 'no'],
    ];

    const wb = XLSX.utils.book_new();
    
    // Deutsche Vorlage hinzufügen
    const wsDE = XLSX.utils.aoa_to_sheet(templateDE);
    XLSX.utils.book_append_sheet(wb, wsDE, 'Vorlage Deutsch');
    
    // Englische Vorlage hinzufügen
    const wsEN = XLSX.utils.aoa_to_sheet(templateEN);
    XLSX.utils.book_append_sheet(wb, wsEN, 'Template English');
    
    XLSX.writeFile(wb, 'CommuniTrack_Import_Vorlage.xlsx');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {!importComplete ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Daten Import</h2>
              <p className="text-gray-600 mt-1">
                Importiere Einträge aus Excel (.xlsx) oder CSV-Dateien
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Vorlage herunterladen
            </Button>
          </div>

          {/* Info Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">Unterstützte Spalten:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <strong>Datum/Date:</strong> Flexibel - TT.MM.JJJJ, MM/TT/JJJJ, JJJJ-MM-TT oder Excel-Datumsformat (Pflichtfeld)
                  </div>
                  <div>
                    <strong>Titel/Title:</strong> Titel des Eintrags (Pflichtfeld)
                  </div>
                  <div>
                    <strong>Beschreibung/Description:</strong> Detaillierte Beschreibung (Pflichtfeld)
                  </div>
                  <div>
                    <strong>Initiator:</strong> Wer hat den Vorfall initiiert
                  </div>
                  <div>
                    <strong>Schlichtungsversuch/Mediation_Attempt:</strong> Lösungsversuche
                  </div>
                  <div>
                    <strong>Chat-Auszug/Chat_Extract:</strong> Relevante Nachrichten
                  </div>
                  <div>
                    <strong>Kategorie/Category:</strong> konflikt, gespraech, verhalten, beweis, kindbetreuung, sonstiges
                  </div>
                  <div>
                    <strong>Schlagworte/Tags:</strong> Komma-getrennte Begriffe
                  </div>
                  <div>
                    <strong>Wichtig/Important:</strong> ja/nein, true/false, 1/0
                  </div>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                >
                  <FileSpreadsheet className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Klicken Sie hier oder ziehen Sie eine Datei hierher
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Unterstützt: .xlsx, .xls, .csv
                  </p>
                </label>
              </div>

              {file && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    Ausgewählte Datei: {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Größe: {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading */}
          {isLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Datei wird verarbeitet...</p>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {preview && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Vorschau</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-green-800 font-medium">
                      {preview.validRows} Gültige Zeilen
                    </p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm text-red-800 font-medium">
                      {preview.invalidRows} Fehlerhafte Zeilen
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-800 font-medium">
                      {preview.headers.length} Spalten erkannt
                    </p>
                  </div>
                </div>

                {preview.errors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Fehler:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {preview.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {preview.errors.length > 10 && (
                        <li className="text-red-600">... und {preview.errors.length - 10} weitere</li>
                      )}
                    </ul>
                  </div>
                )}

                {preview.validRows > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Erste 3 Zeilen zur Überprüfung:</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Titel</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Initiator</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kategorie</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wichtig</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {preview.rows.slice(0, 3).map((row, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {row.date || row.datum || '-'}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-48">
                                {row.title || row.titel || '-'}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-32">
                                {row.initiator || '-'}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {validateCategory(String(row.category || row.kategorie || 'sonstiges'))}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {Boolean(row.isimportant || row.important || row.wichtig) ? 'Ja' : 'Nein'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" onClick={onClose}>
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={preview.validRows === 0 || importing}
                    className="flex items-center"
                  >
                    {importing && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'Importiere...' : `${preview.validRows} Einträge importieren`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Import Results */
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              {importResults?.success === preview?.validRows ? (
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              ) : (
                <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Import abgeschlossen
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {importResults?.success || 0}
                </p>
                <p className="text-sm text-green-800">Erfolgreich importiert</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {importResults?.failed || 0}
                </p>
                <p className="text-sm text-red-800">Fehlgeschlagen</p>
              </div>
            </div>

            {importResults?.errors && importResults.errors.length > 0 && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                <h4 className="text-sm font-medium text-red-800 mb-2">Fehler:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResults.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {importResults.errors.length > 5 && (
                    <li className="text-red-600">... und {importResults.errors.length - 5} weitere</li>
                  )}
                </ul>
              </div>
            )}

            <Button onClick={onClose} className="w-full">
              Schließen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportDialog;
