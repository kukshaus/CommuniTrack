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
  const [isFileSelectionActive, setIsFileSelectionActive] = React.useState(false);
  // Handle escape key and prevent unwanted closes
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleFocusLoss = (e: Event) => {
      // Prevent slide-over from closing when file dialogs open
      if (isFileSelectionActive) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    const handleVisibilityChange = () => {
      // Prevent slide-over from closing when page loses focus due to file dialog
      if (document.hidden && isFileSelectionActive) {
        return;
      }
    };

    // Listen for file input interactions
    const handleFileInputFocus = () => {
      setIsFileSelectionActive(true);
    };

    const handleFileInputBlur = () => {
      setTimeout(() => setIsFileSelectionActive(false), 100);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('blur', handleFocusLoss, true);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleFocusLoss, true);
      
      // Listen for file input events
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        input.addEventListener('focus', handleFileInputFocus);
        input.addEventListener('blur', handleFileInputBlur);
      });
      
      // Prevent body scroll when slide-over is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('blur', handleFocusLoss, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleFocusLoss, true);
      
      // Clean up file input listeners
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        input.removeEventListener('focus', handleFileInputFocus);
        input.removeEventListener('blur', handleFileInputBlur);
      });
      
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isFileSelectionActive]);

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
          'fixed inset-0 bg-black bg-opacity-50 transition-opacity z-[9998]',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={(e) => {
          // Only close if the backdrop itself was clicked, not during file operations
          if (e.target === e.currentTarget && !document.querySelector('input[type="file"]:focus')) {
            onClose();
          }
        }}
      />

      {/* Slide-over container */}
      <div className={cn('fixed inset-0 overflow-hidden z-[9999] pointer-events-none')}>
        <div className={cn('absolute inset-0 overflow-hidden')}>
          <div className={cn(
            'pointer-events-none fixed inset-y-0 w-full flex',
            side === 'right' ? 'justify-end' : 'justify-start'
          )}>
            {/* Slide-over panel */}
            <div
              className={cn(
                'pointer-events-auto transition-transform duration-300 ease-in-out transform relative',
                sizeClasses[size],
                panelTransform
              )}
            >
              <div className="flex h-full flex-col bg-white shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
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
