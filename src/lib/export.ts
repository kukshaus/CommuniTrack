import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { Entry, ExportOptions } from '@/types'
import { formatDate, formatTime, getCategoryLabel } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export async function generatePDF(entries: Entry[], options: ExportOptions): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  let page = pdfDoc.addPage([595.28, 841.89]) // A4 size
  let yPosition = 800
  const margin = 50
  const pageWidth = 595.28 - 2 * margin
  const lineHeight = 14

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const fontSize = options.fontSize || 10
    const font = options.bold ? helveticaBoldFont : helveticaFont
    const maxWidth = options.maxWidth || pageWidth
    
    const words = text.split(' ')
    let line = ''
    let currentY = y

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word
      const textWidth = font.widthOfTextAtSize(testLine, fontSize)
      
      if (textWidth > maxWidth && line) {
        page.drawText(line, {
          x,
          y: currentY,
          size: fontSize,
          font,
          color: options.color || rgb(0, 0, 0)
        })
        line = word
        currentY -= lineHeight
        
        // Check if we need a new page
        if (currentY < margin) {
          page = pdfDoc.addPage([595.28, 841.89])
          currentY = 800
        }
      } else {
        line = testLine
      }
    }
    
    if (line) {
      page.drawText(line, {
        x,
        y: currentY,
        size: fontSize,
        font,
        color: options.color || rgb(0, 0, 0)
      })
      currentY -= lineHeight
    }
    
    return currentY
  }

  // Title
  yPosition = addText('CommuniTrack - Kommunikationsdokumentation', margin, yPosition, {
    fontSize: 16,
    bold: true
  })
  
  yPosition -= 10
  yPosition = addText(`Erstellt am: ${formatDate(new Date().toISOString())}`, margin, yPosition)
  yPosition = addText(`Anzahl Einträge: ${entries.length}`, margin, yPosition)
  yPosition -= 20

  // Sort entries by date and time
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })

  // Add entries
  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i]
    
    // Check if we need a new page
    if (yPosition < margin + 100) {
      page = pdfDoc.addPage([595.28, 841.89])
      yPosition = 800
    }
    
    // Entry header
    yPosition = addText(`${i + 1}. ${entry.title}`, margin, yPosition, {
      fontSize: 12,
      bold: true
    })
    
    yPosition -= 5
    
    // Entry details
    const details = [
      `Datum: ${formatDate(entry.date)} um ${formatTime(entry.time)}`,
      `Kategorie: ${getCategoryLabel(entry.category)}`,
      entry.important ? 'Als wichtig markiert' : '',
      entry.tags.length > 0 ? `Tags: ${entry.tags.join(', ')}` : ''
    ].filter(Boolean)
    
    for (const detail of details) {
      yPosition = addText(detail, margin, yPosition, { fontSize: 9 })
    }
    
    yPosition -= 5
    
    // Description
    yPosition = addText('Beschreibung:', margin, yPosition, { bold: true })
    yPosition = addText(entry.description, margin + 10, yPosition, { maxWidth: pageWidth - 10 })
    
    // Attachments
    if (options.includeAttachments && entry.attachments && entry.attachments.length > 0) {
      yPosition -= 5
      yPosition = addText('Anhänge:', margin, yPosition, { bold: true })
      
      for (const attachment of entry.attachments) {
        yPosition = addText(`- ${attachment.filename}`, margin + 10, yPosition, { fontSize: 9 })
      }
    }
    
    yPosition -= 20
  }

  // Finalize PDF
  const pdfBytes = await pdfDoc.save()
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
}

export function generateJSON(entries: Entry[], options: ExportOptions): Blob {
  const exportData = {
    exportDate: new Date().toISOString(),
    exportOptions: options,
    totalEntries: entries.length,
    entries: entries.map(entry => ({
      ...entry,
      attachments: options.includeAttachments ? entry.attachments : undefined
    }))
  }
  
  const jsonString = JSON.stringify(exportData, null, 2)
  return new Blob([jsonString], { type: 'application/json' })
}

export function generateCSV(entries: Entry[], options: ExportOptions): Blob {
  const headers = [
    'Datum',
    'Uhrzeit',
    'Titel',
    'Kategorie',
    'Beschreibung',
    'Wichtig',
    'Tags',
    'Anhänge',
    'Erstellt am'
  ]
  
  const rows = entries.map(entry => [
    entry.date,
    entry.time,
    `"${entry.title.replace(/"/g, '""')}"`,
    getCategoryLabel(entry.category),
    `"${entry.description.replace(/"/g, '""')}"`,
    entry.important ? 'Ja' : 'Nein',
    `"${entry.tags.join(', ')}"`,
    entry.attachments ? entry.attachments.length.toString() : '0',
    formatDate(entry.created_at, 'dd.MM.yyyy HH:mm')
  ])
  
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF'
  return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
}