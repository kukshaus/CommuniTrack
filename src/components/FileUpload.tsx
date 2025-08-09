import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, FileText, File } from 'lucide-react';
import { cn, compressImage, generateThumbnail, formatFileSize } from '@/lib/utils';
import { Attachment } from '@/types';
import Button from './ui/Button';

interface FileUploadProps {
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  files: File[];
  maxFiles?: number;
  accept?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesAdd,
  onFileRemove,
  files,
  maxFiles = 10,
  accept = 'image/*',
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    setIsProcessing(true);
    const newFiles: File[] = [];
    
    const fileArray = Array.from(fileList);
    
    for (const file of fileArray) {
      if (file.type.startsWith('image/')) {
        try {
          const compressedFile = await compressImage(file);
          newFiles.push(compressedFile);
        } catch (error) {
          console.error('Error compressing image:', error);
          newFiles.push(file);
        }
      } else {
        newFiles.push(file);
      }
    }
    
    onFilesAdd(newFiles);
    setIsProcessing(false);
  }, [onFilesAdd]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow same file selection
    e.target.value = '';
  }, [processFiles]);

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
    
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Add paste event listener
  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const canAddMore = files.length < maxFiles;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400',
          !canAddMore && 'opacity-50 pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={!canAddMore}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Dateien hier ablegen oder
          </p>
          <Button
            variant="outline"
            onClick={handleButtonClick}
            disabled={!canAddMore || isProcessing}
          >
            {isProcessing ? 'Verarbeite...' : 'Dateien auswählen'}
          </Button>
          <p className="text-sm text-gray-500">
            Oder Strg+V zum Einfügen aus der Zwischenablage
          </p>
          <p className="text-xs text-gray-400">
            Max. {maxFiles} Dateien, Bilder werden automatisch komprimiert
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">
            Ausgewählte Dateien ({files.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => onFileRemove(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const [thumbnail, setThumbnail] = useState<string>('');

  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      generateThumbnail(file).then(setThumbnail);
    }
  }, [file]);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-gray-400" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-3">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
      
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={file.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
