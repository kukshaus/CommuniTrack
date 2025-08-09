'use client';

import { useRef } from 'react';
import Dashboard, { DashboardRef } from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppHeader from '@/components/AppHeader';

export default function Home() {
  const dashboardRef = useRef<DashboardRef>(null);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main>
          <Dashboard ref={dashboardRef} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
