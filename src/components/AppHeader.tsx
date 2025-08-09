'use client';

import React from 'react';
import { Coffee, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface AppHeaderProps {}

export default function AppHeader({}: AppHeaderProps) {
  const { user, logout } = useStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">CommuniTrack</h1>
            <span className="ml-4 text-sm text-gray-500">Kommunikationsverläufe</span>
          </div>

          {/* Right side - Coffee link and User Info */}
          <div className="flex items-center space-x-6">
            {/* Buy me a coffee link */}
            <a
              href="https://buymeacoffee.com/sergejk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 group"
              title="Unterstützen Sie das Projekt"
            >
              <Coffee className="h-4 w-4 mr-2 text-orange-500 group-hover:text-orange-600" />
              <span className="hidden md:inline">Kaffee spendieren</span>
              <Heart className="h-3 w-3 ml-1 text-red-400 opacity-70" />
            </a>

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <div className="text-sm text-gray-600">
                Angemeldet als{' '}
                <span className="font-medium text-gray-900">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Admin
                  </span>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
