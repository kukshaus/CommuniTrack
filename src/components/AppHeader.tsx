'use client';

import React from 'react';
import { Plus, Download } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Button from '@/components/ui/Button';

interface AppHeaderProps {
  onNewEntry?: () => void;
  onExport?: () => void;
}

export default function AppHeader({ onNewEntry, onExport }: AppHeaderProps) {
  const { user, logout, entries } = useStore((state) => ({
    user: state.user,
    logout: state.logout,
    entries: state.entries,
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

          {/* Actions and User Info */}
          <div className="flex items-center space-x-4">
            {/* Action Buttons */}
            {onExport && (
              <Button
                variant="outline"
                onClick={onExport}
                disabled={entries.length === 0}
                size="sm"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            
            {onNewEntry && (
              <Button
                onClick={onNewEntry}
                size="sm"
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Neuer Eintrag
              </Button>
            )}

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-sm text-gray-600">
                Angemeldet als{' '}
                <span className="font-medium text-gray-900">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Admin
                  </span>
                )}
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
