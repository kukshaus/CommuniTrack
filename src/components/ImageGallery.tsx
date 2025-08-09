import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import { Attachment } from '@/types';
import Button from './ui/Button';

interface ImageGalleryProps {
  images: Attachment[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  currentIndex, 
  isOpen, 
  onClose,
  onIndexChange 
}) => {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, posX: 0, posY: 0 });
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  // Reset zoom and position when modal opens/closes or image changes
  useEffect(() => {
    if (isOpen && currentImage) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, currentIndex, currentImage]);

  const goToNext = useCallback(() => {
    if (hasMultipleImages && currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      onIndexChange?.(newIndex);
    }
  }, [hasMultipleImages, currentIndex, images.length, onIndexChange]);

  const goToPrevious = useCallback(() => {
    if (hasMultipleImages && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      onIndexChange?.(newIndex);
    }
  }, [hasMultipleImages, currentIndex, onIndexChange]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'g':
        case 'G':
          if (hasMultipleImages) {
            setShowThumbnails(!showThumbnails);
          }
          break;
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
  }, [isOpen, currentIndex, showThumbnails, hasMultipleImages, onClose, goToPrevious, goToNext]);

  const goToImage = (index: number) => {
    onIndexChange?.(index);
    setShowThumbnails(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleDownload = () => {
    if (!currentImage) return;
    
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = currentImage.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mouse drag handlers for zoomed images
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

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1) return; // Don't swipe when zoomed
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || zoom > 1) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
    
    setTouchStart(null);
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[10000]"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black bg-opacity-70 text-white">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium truncate">{currentImage.fileName}</h3>
            <p className="text-sm text-gray-300">
              {Math.round(currentImage.fileSize / 1024)} KB
              {hasMultipleImages && (
                <span className="ml-2">
                  {currentIndex + 1} von {images.length}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {/* Zoom Controls */}
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

            {/* Gallery Toggle */}
            {hasMultipleImages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThumbnails(!showThumbnails)}
                className="text-white hover:bg-white hover:bg-opacity-20"
                title="Galerie anzeigen (G)"
              >
                <Grid className="h-4 w-4" />
              </Button>
            )}

            {/* Download */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Close */}
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

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Thumbnails Strip */}
          {showThumbnails && hasMultipleImages && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex space-x-2 bg-black bg-opacity-70 rounded-lg p-3 max-w-screen-lg overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={`${image.fileName}-${index}`}
                    onClick={() => goToImage(index)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex 
                        ? 'border-blue-500 ring-2 ring-blue-300' 
                        : 'border-white border-opacity-30 hover:border-opacity-50'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.fileName}
                      className="w-full h-full object-cover"
                    />
                    {index === currentIndex && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Container */}
          <div 
            className="w-full h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentImage.url}
              alt={currentImage.fileName}
              className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
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

          {/* Navigation Arrows */}
          {hasMultipleImages && zoom <= 1 && (
            <>
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white transition-all ${
                  currentIndex === 0 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-opacity-70 hover:scale-110'
                }`}
                title="Vorheriges Bild (←)"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={goToNext}
                disabled={currentIndex === images.length - 1}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white transition-all ${
                  currentIndex === images.length - 1 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-opacity-70 hover:scale-110'
                }`}
                title="Nächstes Bild (→)"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Counter Indicator */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2 bg-black bg-opacity-70 rounded-full px-4 py-2">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-40'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          {hasMultipleImages && zoom <= 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-lg">
                ← → Navigation • G für Galerie • ESC schließen
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
