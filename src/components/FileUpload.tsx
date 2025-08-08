'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import { formatFileSize, getFileTypeIcon } from '@/lib/utils';
import { 
  Upload, 
  X, 
  Paperclip, 
  AlertCircle,
  Image as ImageIcon,
  Plus
} from 'lucide-react';

interface FileUploadProps {
  entryId: string;
  onUploadComplete?: () => void;
}

interface PendingFile {
  id: string;
  file: File;
  context: string;
  uploading: boolean;
  error?: string;
}

export function FileUpload({ entryId, onUploadComplete }: FileUploadProps) {
  const { uploadAttachment } = useStore();
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: PendingFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      context: '',
      uploading: false,
    }));
    
    setPendingFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Handle paste events for clipboard images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const newFile: PendingFile = {
              id: Math.random().toString(36).substr(2, 9),
              file,
              context: 'Aus Zwischenablage',
              uploading: false,
            };
            setPendingFiles(prev => [...prev, newFile]);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const updateFileContext = (fileId: string, context: string) => {
    setPendingFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, context } : f)
    );
  };

  const removeFile = (fileId: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFile = async (pendingFile: PendingFile) => {
    try {
      setPendingFiles(prev => 
        prev.map(f => f.id === pendingFile.id ? { ...f, uploading: true, error: undefined } : f)
      );

      await uploadAttachment(entryId, pendingFile.file, pendingFile.context);
      
      // Remove from pending files
      setPendingFiles(prev => prev.filter(f => f.id !== pendingFile.id));
      onUploadComplete?.();
    } catch (error) {
      setPendingFiles(prev => 
        prev.map(f => f.id === pendingFile.id ? { 
          ...f, 
          uploading: false, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f)
      );
    }
  };

  const uploadAllFiles = async () => {
    const filesToUpload = pendingFiles.filter(f => !f.uploading);
    
    for (const file of filesToUpload) {
      await uploadFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onDrop(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card className={`transition-colors ${
        isDragActive || dragActive ? 'border-primary bg-primary/5' : ''
      }`}>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className="text-center space-y-4 cursor-pointer"
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDrop={() => setDragActive(false)}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Dateien hierher ziehen oder klicken zum Auswählen
                </p>
                <p className="text-xs text-muted-foreground">
                  Bilder, PDFs, Dokumente (max. 10MB)
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              💡 Tipp: Sie können auch Bilder mit Strg+V aus der Zwischenablage einfügen
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Upload Button */}
      <div className="text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          accept="image/*,.pdf,.txt,.doc,.docx"
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Dateien auswählen
        </Button>
      </div>

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Dateien zum Upload ({pendingFiles.length})
            </h4>
            <Button
              size="sm"
              onClick={uploadAllFiles}
              disabled={pendingFiles.some(f => f.uploading)}
            >
              Alle hochladen
            </Button>
          </div>

          <div className="space-y-2">
            {pendingFiles.map((pendingFile) => (
              <Card key={pendingFile.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="text-lg">
                    {getFileTypeIcon(pendingFile.file.type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {pendingFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(pendingFile.file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => uploadFile(pendingFile)}
                          disabled={pendingFile.uploading}
                        >
                          {pendingFile.uploading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            'Upload'
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(pendingFile.id)}
                          disabled={pendingFile.uploading}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Input
                      placeholder="Kontext/Beschreibung (optional)"
                      value={pendingFile.context}
                      onChange={(e) => updateFileContext(pendingFile.id, e.target.value)}
                      disabled={pendingFile.uploading}
                      className="text-xs"
                    />
                    
                    {pendingFile.error && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {pendingFile.error}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
