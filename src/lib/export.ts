import { Entry, ExportOptions } from '@/types';
import { formatDate } from './utils';
import jsPDF from 'jspdf';

// Helper function for file size formatting
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// HTML Export with embedded images
export const exportToHTML = async (entries: Entry[], options: ExportOptions): Promise<Blob> => {
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
        .attachments-header { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #374151; }
        .attachment-item { font-size: 12px; color: #6b7280; margin-bottom: 15px; }
        .attachment-image { max-width: 100%; max-height: 400px; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 5px; }
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
              ${entry.attachments.map(attachment => {
                const isImage = attachment.fileType.startsWith('image/');
                if (isImage) {
                  return `
                    <div class="attachment-item">
                      <div style="margin-bottom: 10px;">
                        <strong>${attachment.fileName}</strong> (${formatFileSize(attachment.fileSize)})${attachment.context ? ` - ${attachment.context}` : ''}
                      </div>
                      <img src="${attachment.url}" alt="${attachment.fileName}" class="attachment-image" />
                    </div>
                  `;
                } else {
                  return `<div class="attachment-item">• ${attachment.fileName} (${formatFileSize(attachment.fileSize)})${attachment.context ? ` - ${attachment.context}` : ''}</div>`;
                }
              }).join('')}
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

// PDF Export with embedded images using jsPDF
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

  // Create new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Helper function to wrap text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    let currentY = y;
    
    for (const line of lines) {
      checkPageBreak(fontSize * 0.5);
      pdf.text(line, x, currentY);
      currentY += fontSize * 0.5;
    }
    return currentY;
  };

  // Helper function to add image
  const addImageToPDF = async (imageUrl: string, x: number, y: number, maxWidth: number, maxHeight: number) => {
    try {
      // Calculate image dimensions
      const img = new Image();
      img.src = imageUrl;
      
      return new Promise<number>((resolve) => {
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let width = Math.min(maxWidth, img.width * 0.1); // Scale down
          let height = width / aspectRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
          
          checkPageBreak(height);
          pdf.addImage(imageUrl, 'JPEG', x, yPosition, width, height);
          resolve(yPosition + height + 5);
        };
        
        img.onerror = () => {
          resolve(y); // Skip image if error
        };
      });
    } catch (error) {
      return y; // Skip image if error
    }
  };

  // Title page
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CommuniTrack Export', margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Exportiert am: ${formatDate(new Date())}`, margin, yPosition);
  yPosition += 8;

  if (options.dateRange) {
    pdf.text(`Zeitraum: ${formatDate(options.dateRange.start)} - ${formatDate(options.dateRange.end)}`, margin, yPosition);
    yPosition += 8;
  }

  pdf.text(`Anzahl Einträge: ${entries.length}`, margin, yPosition);
  yPosition += 15;

  // Draw line
  pdf.setDrawColor(14, 165, 233);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Process each entry
  for (const entry of entries) {
    checkPageBreak(40); // Check if we need space for entry header

    // Entry title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const titleText = `${entry.title}${entry.isImportant ? ' ⭐' : ''}`;
    yPosition = addWrappedText(titleText, margin, yPosition, contentWidth, 14);
    yPosition += 2;

    // Entry metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    pdf.text(`Datum: ${formatDate(new Date(entry.date))}`, margin, yPosition);
    yPosition += 5;
    
    pdf.text(`Kategorie: ${getCategoryLabel(entry.category)}`, margin, yPosition);
    yPosition += 5;

    if (entry.attachments.length > 0) {
      pdf.text(`Anhänge: ${entry.attachments.length} Datei(en)`, margin, yPosition);
      yPosition += 5;
    }

    yPosition += 3;

    // Entry description
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    yPosition = addWrappedText(entry.description, margin, yPosition, contentWidth, 10);
    yPosition += 5;

    // Attachments
    if (options.includeImages && entry.attachments.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Anhänge:', margin, yPosition);
      yPosition += 8;

      for (const attachment of entry.attachments) {
        checkPageBreak(20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const attachmentText = `• ${attachment.fileName} (${formatFileSize(attachment.fileSize)})${attachment.context ? ` - ${attachment.context}` : ''}`;
        yPosition = addWrappedText(attachmentText, margin + 5, yPosition, contentWidth - 5, 10);
        
        // Add image if it's an image attachment
        if (attachment.fileType.startsWith('image/')) {
          checkPageBreak(60);
          yPosition = await addImageToPDF(attachment.url, margin + 5, yPosition + 2, contentWidth - 10, 60);
          yPosition += 3;
        }
      }
    }

    // Tags
    if (entry.tags.length > 0) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      const tagsText = entry.tags.map(tag => `#${tag}`).join(' ');
      yPosition = addWrappedText(`Tags: ${tagsText}`, margin, yPosition, contentWidth, 9);
    }

    // Add spacing between entries
    yPosition += 15;

    // Draw separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition - 7, pageWidth - margin, yPosition - 7);
  }

  // Get PDF as blob
  const pdfBlob = pdf.output('blob');
  return pdfBlob;
};

// Excel Export using CSV format (no images, only data)
export const exportToExcel = async (entries: Entry[], options: ExportOptions): Promise<Blob> => {
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

  // Create CSV content
  const headers = [
    'Titel',
    'Datum',
    'Kategorie',
    'Beschreibung',
    'Tags',
    'Wichtig',
    'Anzahl Anhänge',
    'Anhang-Details (ohne Bilder)',
    'Erstellt am',
    'Aktualisiert am'
  ];

  const csvRows = [
    headers.join(','),
    ...entries.map(entry => {
      const csvRow = [
        `"${entry.title.replace(/"/g, '""')}"`,
        `"${formatDate(new Date(entry.date))}"`,
        `"${getCategoryLabel(entry.category)}"`,
        `"${entry.description.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, ' ')}"`,
        `"${entry.tags.join(', ')}"`,
        `"${entry.isImportant ? 'Ja' : 'Nein'}"`,
        `"${entry.attachments.length}"`,
        `"${entry.attachments.map(att => `${att.fileName} (${formatFileSize(att.fileSize)})${att.context ? ` - ${att.context}` : ''}`).join('; ')}"`,
        `"${formatDate(new Date(entry.createdAt))}"`,
        `"${formatDate(new Date(entry.updatedAt))}"`
      ];
      return csvRow.join(',');
    })
  ];

  const csvContent = csvRows.join('\n');

  // Add BOM for proper Excel encoding
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { 
    type: 'text/csv;charset=utf-8' 
  });
  
  return blob;
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
