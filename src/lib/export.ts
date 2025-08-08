import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Entry, ExportOptions } from '@/types';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export class ExportService {
  
  static async exportToPDF(entries: Entry[], options: ExportOptions): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CommuniTrack Export', margin, yPosition);
    yPosition += 15;

    // Export info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Exportiert am: ${formatDate(new Date())}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Anzahl Einträge: ${entries.length}`, margin, yPosition);
    yPosition += 15;

    // Process each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      // Entry header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      
      const title = entry.is_important ? `⭐ ${entry.title}` : entry.title;
      const titleLines = pdf.splitTextToSize(title, contentWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 7;

      // Entry metadata
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      
      const metadata = [
        `Datum: ${formatDate(entry.event_date)}`,
        entry.category ? `Kategorie: ${entry.category.name}` : '',
        entry.tags.length > 0 ? `Tags: ${entry.tags.join(', ')}` : '',
        entry.attachments && entry.attachments.length > 0 ? `Anhänge: ${entry.attachments.length}` : ''
      ].filter(Boolean).join(' | ');
      
      const metadataLines = pdf.splitTextToSize(metadata, contentWidth);
      pdf.text(metadataLines, margin, yPosition);
      yPosition += metadataLines.length * 5 + 5;

      // Entry description
      if (entry.description) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        const descriptionLines = pdf.splitTextToSize(entry.description, contentWidth);
        pdf.text(descriptionLines, margin, yPosition);
        yPosition += descriptionLines.length * 5 + 5;
      }

      // Attachments list
      if (entry.attachments && entry.attachments.length > 0 && options.includeAttachments) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Anhänge:', margin, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'normal');
        entry.attachments.forEach(attachment => {
          const attachmentText = `• ${attachment.file_name}`;
          const attachmentLine = pdf.splitTextToSize(attachmentText, contentWidth - 10);
          pdf.text(attachmentLine, margin + 5, yPosition);
          yPosition += attachmentLine.length * 4;
          
          if (attachment.context) {
            pdf.setTextColor(100, 100, 100);
            const contextLines = pdf.splitTextToSize(`  ${attachment.context}`, contentWidth - 10);
            pdf.text(contextLines, margin + 5, yPosition);
            yPosition += contextLines.length * 4;
            pdf.setTextColor(0, 0, 0);
          }
        });
        yPosition += 5;
      }

      // Add separator line
      if (i < entries.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    }

    // Footer on each page
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Seite ${i} von ${pageCount}`, pageWidth - margin - 30, pageHeight - 10);
      pdf.text('CommuniTrack Export', margin, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `CommuniTrack_Export_${formatDate(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
    pdf.save(fileName);
  }

  static async exportToJSON(entries: Entry[], options: ExportOptions): Promise<void> {
    const exportData = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalEntries: entries.length,
        includeAttachments: options.includeAttachments,
        filters: options.categories || null,
        dateRange: options.dateRange || null,
      },
      entries: entries.map(entry => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        category: entry.category ? {
          id: entry.category.id,
          name: entry.category.name,
          color: entry.category.color,
        } : null,
        eventDate: entry.event_date,
        isImportant: entry.is_important,
        tags: entry.tags,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        attachments: options.includeAttachments && entry.attachments ? 
          entry.attachments.map(att => ({
            id: att.id,
            fileName: att.file_name,
            filePath: att.file_path,
            fileSize: att.file_size,
            fileType: att.file_type,
            isImportant: att.is_important,
            context: att.context,
            createdAt: att.created_at,
          })) : [],
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `CommuniTrack_Export_${formatDate(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
    saveAs(blob, fileName);
  }

  static async exportToCSV(entries: Entry[], options: ExportOptions): Promise<void> {
    const headers = [
      'Titel',
      'Beschreibung',
      'Kategorie',
      'Datum',
      'Wichtig',
      'Tags',
      'Anhänge_Anzahl',
      'Erstellt_am',
      'Aktualisiert_am'
    ];

    const rows = entries.map(entry => [
      entry.title,
      entry.description || '',
      entry.category?.name || '',
      formatDate(entry.event_date),
      entry.is_important ? 'Ja' : 'Nein',
      entry.tags.join('; '),
      entry.attachments?.length || 0,
      formatDate(entry.created_at),
      formatDate(entry.updated_at),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `CommuniTrack_Export_${formatDate(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    saveAs(blob, fileName);
  }

  static async downloadAttachments(entries: Entry[]): Promise<void> {
    // This would create a ZIP file with all attachments
    // For now, we'll just show a message about individual downloads
    alert('Anhänge können einzeln über die Einträge heruntergeladen werden.');
  }

  static filterEntriesByOptions(entries: Entry[], options: ExportOptions): Entry[] {
    let filteredEntries = [...entries];

    // Date range filter
    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.event_date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    // Category filter
    if (options.categories && options.categories.length > 0) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.category_id && options.categories!.includes(entry.category_id)
      );
    }

    return filteredEntries;
  }
}
