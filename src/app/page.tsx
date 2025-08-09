'use client';

import { useRef } from 'react';
import Dashboard, { DashboardRef } from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppHeader from '@/components/AppHeader';

export default function Home() {
  const dashboardRef = useRef<DashboardRef>(null);

  const handleOpenSettings = () => {
    dashboardRef.current?.handleOpenSettings();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader onOpenSettings={handleOpenSettings} />
        <main>
          <Dashboard ref={dashboardRef} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
