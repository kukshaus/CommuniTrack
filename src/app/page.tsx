'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/store/useStore'
import AuthPage from '@/components/AuthPage'
import Dashboard from '@/components/Dashboard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const { isLoading } = useStore()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <main className="min-h-screen bg-white">
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
    </main>
  )
}