'use client';

import React from 'react';
import { Coffee, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface AppHeaderProps {
  onOpenSettings?: () => void;
}

export default function AppHeader({ onOpenSettings }: AppHeaderProps) {
  const { user, logout } = useStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              CommuniTrack
            </h1>
          </div>

          {/* Right side - Clean and minimal */}
          <div className="flex items-center space-x-4">
            {/* Coffee link - simplified */}
            <a
              href="https://buymeacoffee.com/sergejk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all duration-200 group"
              title="Support CommuniTrack"
            >
              <Coffee className="h-4 w-4 text-orange-500 group-hover:text-orange-600" />
            </a>

            {/* Settings button */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Einstellungen"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}

            {/* User menu - simplified */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                {user.role === 'admin' && (
                  <div className="text-xs text-blue-600 font-medium">Admin</div>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Abmelden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
