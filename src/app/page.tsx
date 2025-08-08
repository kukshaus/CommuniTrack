'use client';

import { useEffect, useState } from 'react';
import { AuthPage } from '@/components/AuthPage';
import { Dashboard } from '@/components/Dashboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ConfigurationCheck } from '@/components/ConfigurationCheck';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = supabaseUrl && supabaseKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseKey !== 'placeholder-key';

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">CommuniTrack wird geladen...</p>
        </div>
      </div>
    );
  }

  // Show configuration check if Supabase is not properly configured
  if (!isConfigured) {
    return <ConfigurationCheck />;
  }

  // Use auth hook only if Supabase is configured
  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Authentifizierung wird überprüft...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <Dashboard />;
}
