import React, { useState } from 'react';
import { 
  Calendar, 
  Tag, 
  Star, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  FileText,
  File,
  ExternalLink,
  Clock,
  User
} from 'lucide-react';
import { Entry, Attachment } from '@/types';
import { formatDate } from '@/lib/utils';
import Button from './ui/Button';
import ImageModal from './ImageModal';

interface EntryDetailsProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: string) => void;
  onClose: () => void;
}

const EntryDetails: React.FC<EntryDetailsProps> = ({
  entry,
  onEdit,
  onDelete,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleImageClick = (attachment: Attachment) => {
    setSelectedImage(attachment);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleEdit = () => {
    onEdit(entry);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?')) {
      if (entry._id) {
        onDelete(entry._id);
        onClose();
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      konflikt: 'bg-red-100 text-red-800 border-red-200',
      gespraech: 'bg-blue-100 text-blue-800 border-blue-200',
      verhalten: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      beweis: 'bg-purple-100 text-purple-800 border-purple-200',
      kindbetreuung: 'bg-green-100 text-green-800 border-green-200',
      sonstiges: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category as keyof typeof colors] || colors.sonstiges;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      konflikt: 'Konflikt',
      gespraech: 'Gespräch',
      verhalten: 'Verhalten',
      beweis: 'Beweis',
      kindbetreuung: 'Kindbetreuung',
      sonstiges: 'Sonstiges',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-gray-400" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleAttachmentClick = (attachment: Attachment) => {
    if (attachment.fileType.startsWith('image/')) {
      handleImageClick(attachment);
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{entry.title}</h1>
              {entry.isImportant && (
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(new Date(entry.date))}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Erstellt: {formatDate(new Date(entry.createdAt))}</span>
              </div>
            </div>

            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(entry.category)}`}>
              {getCategoryLabel(entry.category)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Bearbeiten
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Löschen
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Beschreibung</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-wrap">{entry.description}</p>
        </div>
      </div>

      {/* Attachments */}
      {entry.attachments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Anhänge ({entry.attachments.length})
          </h3>
          <div className="space-y-3">
            {entry.attachments.map((attachment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                {attachment.fileType.startsWith('image/') ? (
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => handleAttachmentClick(attachment)}
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.fileName}
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                    {attachment.isImportant && (
                      <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                ) : (
                  <div
                    className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors group"
                    onClick={() => handleAttachmentClick(attachment)}
                  >
                    {getFileIcon(attachment.fileType)}
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                
                {/* Attachment metadata */}
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{attachment.fileName}</span>
                    <span>{formatDate(new Date(attachment.uploadedAt))}</span>
                  </div>
                  {attachment.context && (
                    <p className="text-xs text-gray-600 mt-1">{attachment.context}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Metadaten</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Erstellt:</span>
            <span className="text-gray-900">{formatDate(new Date(entry.createdAt))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Zuletzt bearbeitet:</span>
            <span className="text-gray-900">{formatDate(new Date(entry.updatedAt))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Wichtig:</span>
            <span className="text-gray-900">{entry.isImportant ? 'Ja' : 'Nein'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Anhänge:</span>
            <span className="text-gray-900">{entry.attachments.length}</span>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        attachment={selectedImage}
        isOpen={isImageModalOpen}
        onClose={handleCloseImageModal}
      />
    </div>
  );
};

export default EntryDetails;
