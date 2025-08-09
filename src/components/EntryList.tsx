import React, { useState } from 'react';
import { 
  Calendar, 
  Image as ImageIcon, 
  Star, 
  Edit, 
  Trash2, 
  Tag,
  MoreVertical,
  FileText,
  File,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Entry, Attachment } from '@/types';
import { useStore } from '@/store/useStore';
import { formatDate } from '@/lib/utils';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import ImageModal from './ImageModal';
import SlideOver from './ui/SlideOver';
import EntryDetails from './EntryDetails';

interface EntryListProps {
  onEditEntry: (entry: Entry) => void;
}

const EntryList: React.FC<EntryListProps> = ({ onEditEntry }) => {
  const { filteredEntries, deleteEntry, setLoading, user } = useStore();
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const handleImageClick = (attachment: Attachment) => {
    setSelectedImage(attachment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const handleEntryClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsSlideOverOpen(true);
  };

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
    setSelectedEntry(null);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?')) {
      return;
    }

    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/entries/${entryId}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        deleteEntry(entryId);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      konflikt: 'bg-red-100 text-red-800',
      gespraech: 'bg-blue-100 text-blue-800',
      verhalten: 'bg-yellow-100 text-yellow-800',
      beweis: 'bg-purple-100 text-purple-800',
      kindbetreuung: 'bg-green-100 text-green-800',
      sonstiges: 'bg-gray-100 text-gray-800',
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

  if (filteredEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Einträge gefunden
        </h3>
        <p className="text-gray-500">
          Erstellen Sie Ihren ersten Eintrag oder passen Sie Ihre Filter an.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {filteredEntries.map((entry, index) => (
          <div key={entry._id} className="relative">
            {/* Timeline dot */}
            <div className={`absolute left-6 w-4 h-4 rounded-full border-2 bg-white ${
              entry.isImportant ? 'border-red-500' : 'border-gray-300'
            }`} />
            
            {/* Entry Card */}
            <div className="ml-16 mb-8">
              <Card hover className="transition-all duration-200 hover:shadow-lg">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {entry.title}
                        </h3>
                        {entry.isImportant && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(new Date(entry.date))}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                          {getCategoryLabel(entry.category)}
                        </span>
                        
                        {entry.attachments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-4 w-4" />
                            {entry.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEntryClick(entry)}
                        title="Details anzeigen"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditEntry(entry)}
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => entry._id && handleDeleteEntry(entry._id)}
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {entry.description}
                    </p>
                  </div>

                  {/* Attachments */}
                  {entry.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Anhänge ({entry.attachments.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {entry.attachments.map((attachment, attachIndex) => (
                          <AttachmentPreview
                            key={attachIndex}
                            attachment={attachment}
                            onImageClick={handleImageClick}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      <ImageModal
        attachment={selectedImage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Entry Details Slide-over */}
      {selectedEntry && (
        <SlideOver
          isOpen={isSlideOverOpen}
          onClose={handleCloseSlideOver}
          title="Eintrag Details"
          side="right"
          size="xl"
        >
          <EntryDetails
            entry={selectedEntry}
            onEdit={onEditEntry}
            onDelete={handleDeleteEntry}
            onClose={handleCloseSlideOver}
          />
        </SlideOver>
      )}
    </div>
  );
};

interface AttachmentPreviewProps {
  attachment: Attachment;
  onImageClick: (attachment: Attachment) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment, onImageClick }) => {
  const handleClick = () => {
    if (attachment.fileType.startsWith('image/')) {
      onImageClick(attachment);
    } else {
      // For non-image files (PDFs, documents, etc.), open in new tab
      window.open(attachment.url, '_blank');
    }
  };

  const getFileIcon = () => {
    if (attachment.fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />;
    } else if (attachment.fileType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />;
    } else {
      return <File className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />;
    }
  };

  if (attachment.fileType.startsWith('image/')) {
    return (
      <div
        className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100"
        onClick={handleClick}
      >
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="w-full h-20 object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
        {attachment.isImportant && (
          <Star className="absolute top-1 right-1 h-3 w-3 text-yellow-500 fill-current" />
        )}
      </div>
    );
  }

  return (
    <div 
      className="flex items-center p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
      onClick={handleClick}
      title={`${attachment.fileName} öffnen`}
    >
      {getFileIcon()}
      <span className="text-xs text-gray-600 truncate flex-1">
        {attachment.fileName}
      </span>
      <ExternalLink className="h-3 w-3 text-gray-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default EntryList;
