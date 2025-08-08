import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid } from "date-fns"
import { de } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = 'dd.MM.yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Ungültiges Datum'
    return format(dateObj, formatStr, { locale: de })
  } catch {
    return 'Ungültiges Datum'
  }
}

export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  } catch {
    return time
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    konflikt: 'Konflikt',
    gespraech: 'Gespräch',
    verhalten: 'Verhalten',
    beweis: 'Beweis',
    kindbetreuung: 'Kindbetreuung',
    sonstiges: 'Sonstiges'
  }
  return labels[category] || category
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    konflikt: 'bg-red-100 text-red-800 border-red-200',
    gespraech: 'bg-blue-100 text-blue-800 border-blue-200',
    verhalten: 'bg-orange-100 text-orange-800 border-orange-200',
    beweis: 'bg-purple-100 text-purple-800 border-purple-200',
    kindbetreuung: 'bg-green-100 text-green-800 border-green-200',
    sonstiges: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[category] || colors.sonstiges
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase()
}

export function isValidImageType(type: string): boolean {
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(type)
}