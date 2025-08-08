'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user, hasAnyUsers } = useStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    hasAnyUsers: state.hasAnyUsers,
  }));
  
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show loading during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show registration form if no users exist yet
  if (!hasAnyUsers()) {
    return <RegisterForm />;
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  // Show protected content
  return <>{children}</>;
}
