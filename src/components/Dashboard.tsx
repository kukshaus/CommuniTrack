'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import EntryForm from '@/components/EntryForm'
import EntryList from '@/components/EntryList'
import FilterBar from '@/components/FilterBar'
import ExportDialog from '@/components/ExportDialog'
import { supabase } from '@/lib/supabase'
import { LogOut, Plus, FileDown, FileText, Calendar, Settings } from 'lucide-react'

export default function Dashboard() {
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const { signOut, user } = useAuth()
  const { entries, setEntries, setIsLoading } = useStore()

  useEffect(() => {
    loadEntries()
  }, [user])

  const loadEntries = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('entries')
        .select(`
          *,
          attachments (*)
        `)
        .order('date', { ascending: false })
        .order('time', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = {
    totalEntries: entries.length,
    importantEntries: entries.filter(e => e.important).length,
    entriesThisMonth: entries.filter(e => {
      const entryDate = new Date(e.date)
      const now = new Date()
      return entryDate.getMonth() === now.getMonth() && 
             entryDate.getFullYear() === now.getFullYear()
    }).length,
    categoryCounts: entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">CommuniTrack</h1>
                              <p className="text-sm text-gray-600">
                Willkommen zurück, {user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Gesamt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries}</div>
              <p className="text-xs text-gray-600">Einträge</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Diesen Monat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.entriesThisMonth}</div>
              <p className="text-xs text-gray-600">Neue Einträge</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Wichtig
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.importantEntries}</div>
              <p className="text-xs text-gray-600">Markierte Einträge</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Kategorien
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.categoryCounts).slice(0, 2).map(([category, count]) => (
                  <div key={category} className="flex justify-between text-xs">
                    <span className="capitalize">{category}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            onClick={() => setShowEntryForm(true)}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Eintrag
          </Button>
          <div className="flex-1">
            <FilterBar />
          </div>
        </div>

        {/* Main Content */}
        <EntryList onRefresh={loadEntries} />

        {/* Dialogs */}
        {showEntryForm && (
          <EntryForm 
            onClose={() => setShowEntryForm(false)}
            onSuccess={() => {
              setShowEntryForm(false)
              loadEntries()
            }}
          />
        )}

        {showExportDialog && (
          <ExportDialog 
            onClose={() => setShowExportDialog(false)}
          />
        )}
      </div>
    </div>
  )
}