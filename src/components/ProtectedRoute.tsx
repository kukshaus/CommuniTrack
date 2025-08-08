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
  const { isAuthenticated, user } = useStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));
  
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasAnyUsers, setHasAnyUsers] = useState<boolean | null>(null);

  // Handle hydration and check for users
  useEffect(() => {
    setIsHydrated(true);
    
    // Check if any users exist in the database
    const checkUsers = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const data = await response.json();
          setHasAnyUsers(data.hasUsers);
        }
      } catch (error) {
        console.error('Error checking users:', error);
        setHasAnyUsers(false);
      }
    };
    
    checkUsers();
  }, []);

  // Show loading during hydration or while checking users
  if (!isHydrated || hasAnyUsers === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show registration form if no users exist yet
  if (!hasAnyUsers) {
    return <RegisterForm />;
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  // Show protected content
  return <>{children}</>;
}
