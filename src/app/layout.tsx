import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CommuniTrack - Kommunikation dokumentieren',
  description: 'Dokumentation, Organisation und Export von kommunikationsbezogenen Ereignissen',
  keywords: ['Dokumentation', 'Kommunikation', 'Rechtssicher', 'Export'],
  authors: [{ name: 'CommuniTrack' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}