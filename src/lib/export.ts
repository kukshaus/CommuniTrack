import { Entry, ExportOptions } from '@/types';
import { formatDate } from './utils';

// Helper function for file size formatting
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Simple PDF generation using jsPDF alternative - for now we'll create a simple HTML to PDF
export const exportToPDF = async (entries: Entry[], options: ExportOptions): Promise<Blob> => {
  const getCategoryLabel = (category: string) => {
    const labels = {
      konflikt: 'Konflikt',
      gespraech: 'Gespräch', 
      verhalten: 'Verhalten',
      beweis: 'Beweis',
      kindbetreuung: 'Kindbetreuung',
      sonstiges: 'Sonstiges',
    };
    return labels[category as keyof typeof labels] || category;
  };

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CommuniTrack Export</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
        .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
        .entry { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px; page-break-inside: avoid; }
        .entry.important { background-color: #fef3c7; border-color: #f59e0b; }
        .entry-header { border-bottom: 1px solid #f3f4f6; padding-bottom: 12px; margin-bottom: 15px; }
        .entry-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
        .entry-meta { font-size: 12px; color: #6b7280; margin-bottom: 3px; }
        .entry-description { font-size: 13px; color: #374151; margin-bottom: 15px; white-space: pre-wrap; }
        .attachments { margin-bottom: 15px; }
        .attachments-header { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
        .attachment-item { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
        .tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
        .page-break { page-break-before: always; }
        @media print { body { margin: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">CommuniTrack Export</div>
        <div class="subtitle">Exportiert am ${formatDate(new Date())}</div>
        ${options.dateRange ? `<div class="subtitle">Zeitraum: ${formatDate(options.dateRange.start)} - ${formatDate(options.dateRange.end)}</div>` : ''}
        <div class="subtitle">Anzahl Einträge: ${entries.length}</div>
      </div>
      
      ${entries.map((entry, index) => `
        <div class="entry ${entry.isImportant ? 'important' : ''} ${index > 0 ? 'page-break' : ''}">
          <div class="entry-header">
            <div class="entry-title">${entry.title} ${entry.isImportant ? '⭐' : ''}</div>
            <div class="entry-meta">Datum: ${formatDate(new Date(entry.date))}</div>
            <div class="entry-meta">Kategorie: ${getCategoryLabel(entry.category)}</div>
            ${entry.attachments.length > 0 ? `<div class="entry-meta">Anhänge: ${entry.attachments.length} Datei(en)</div>` : ''}
          </div>
          
          <div class="entry-description">${entry.description}</div>
          
          ${options.includeImages && entry.attachments.length > 0 ? `
            <div class="attachments">
              <div class="attachments-header">Anhänge:</div>
              ${entry.attachments.map(attachment => `
                <div class="attachment-item">• ${attachment.fileName} (${formatFileSize(attachment.fileSize)})${attachment.context ? ` - ${attachment.context}` : ''}</div>
              `).join('')}
            </div>
          ` : ''}
          
          ${entry.tags.length > 0 ? `
            <div class="tags">
              ${entry.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  // Create blob from HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return blob;
};

export const exportToJSON = (entries: Entry[], options: ExportOptions): string => {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      entryCount: entries.length,
      dateRange: options.dateRange,
      includeImages: options.includeImages,
    },
    entries: entries.map(entry => ({
      ...entry,
      // Convert attachments to base64 if including images
      attachments: options.includeImages 
        ? entry.attachments 
        : entry.attachments.map(att => ({
            ...att,
            url: '[Bild nicht exportiert]'
          }))
    })),
  };
  
  return JSON.stringify(exportData, null, 2);
};

export const exportToCSV = (entries: Entry[], options: ExportOptions): string => {
  const headers = [
    'Titel',
    'Datum',
    'Kategorie',
    'Beschreibung',
    'Tags',
    'Wichtig',
    'Anhänge',
    'Erstellt am',
    'Aktualisiert am'
  ];
  
  const rows = entries.map(entry => [
    `"${entry.title.replace(/"/g, '""')}"`,
    formatDate(new Date(entry.date)),
    entry.category,
    `"${entry.description.replace(/"/g, '""')}"`,
    `"${entry.tags.join(', ')}"`,
    entry.isImportant ? 'Ja' : 'Nein',
    entry.attachments.length.toString(),
    formatDate(new Date(entry.createdAt)),
    formatDate(new Date(entry.updatedAt)),
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

// Download helper
export const downloadFile = (content: string | Blob, filename: string, type: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
