import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const SlideOver: React.FC<SlideOverProps> = ({
  isOpen,
  onClose,
  title,
  side = 'right',
  size = 'lg',
  children,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when slide-over is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const panelTransform = side === 'right' 
    ? (isOpen ? 'translate-x-0' : 'translate-x-full')
    : (isOpen ? 'translate-x-0' : '-translate-x-full');

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Slide-over container */}
      <div className={cn('fixed inset-0 overflow-hidden z-50 pointer-events-none')}>
        <div className={cn('absolute inset-0 overflow-hidden')}>
          <div className={cn(
            'pointer-events-none fixed inset-y-0 w-full flex',
            side === 'right' ? 'justify-end' : 'justify-start'
          )}>
            {/* Slide-over panel */}
            <div
              className={cn(
                'pointer-events-auto transition-transform duration-300 ease-in-out transform',
                sizeClasses[size],
                panelTransform
              )}
            >
              <div className="flex h-full flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideOver;
