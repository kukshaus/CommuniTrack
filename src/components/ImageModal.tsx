import React from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Attachment } from '@/types';
import Button from './ui/Button';

interface ImageModalProps {
  attachment: Attachment | null;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ attachment, isOpen, onClose }) => {
  const [zoom, setZoom] = React.useState(1);
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0, posX: 0, posY: 0 });

  // Reset zoom and position when modal opens/closes or image changes
  React.useEffect(() => {
    if (isOpen && attachment) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, attachment]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleDownload = () => {
    if (!attachment) return;
    
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setPosition({
      x: dragStart.posX + deltaX,
      y: dragStart.posY + deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !attachment) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="relative max-w-full max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white rounded-t-lg">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium truncate">{attachment.fileName}</h3>
            <p className="text-sm text-gray-300">
              {Math.round(attachment.fileSize / 1024)} KB
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-300 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div 
          className="flex-1 overflow-hidden flex items-center justify-center bg-black rounded-b-lg"
          style={{ minHeight: '400px', maxHeight: 'calc(100vh - 200px)' }}
        >
          <img
            src={attachment.url}
            alt={attachment.fileName}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
