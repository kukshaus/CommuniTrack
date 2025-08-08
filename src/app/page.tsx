'use client';

import { useRef } from 'react';
import Dashboard, { DashboardRef } from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppHeader from '@/components/AppHeader';

export default function Home() {
  const dashboardRef = useRef<DashboardRef>(null);

  const handleNewEntry = () => {
    dashboardRef.current?.handleNewEntry();
  };

  const handleExport = () => {
    dashboardRef.current?.handleExport();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          onNewEntry={handleNewEntry}
          onExport={handleExport}
        />
        <main>
          <Dashboard ref={dashboardRef} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
