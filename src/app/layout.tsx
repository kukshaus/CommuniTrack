import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CommuniTrack - Private Kommunikationsdokumentation',
  description: 'Dokumentation, Organisation und Export von kommunikationsbezogenen Ereignissen',
  robots: 'noindex, nofollow', // Privacy: Don't index this app
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
        {children}
      </body>
    </html>
  )
}
