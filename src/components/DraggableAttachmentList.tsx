import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { X, GripVertical, FileText } from 'lucide-react';
import { Attachment } from '@/types';

interface DraggableAttachmentListProps {
  attachments: Attachment[];
  onReorder: (attachments: Attachment[]) => void;
  onRemove: (index: number) => void;
  title: string;
}

const DraggableAttachmentList: React.FC<DraggableAttachmentListProps> = ({
  attachments,
  onReorder,
  onRemove,
  title,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(attachments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-600 mb-2">
        {title} ({attachments.length})
      </h4>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="attachments">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
              }`}
            >
              {attachments.map((attachment, index) => (
                <Draggable
                  key={`attachment-${index}`}
                  draggableId={`attachment-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative bg-white border border-gray-200 rounded-lg p-3 transition-all ${
                        snapshot.isDragging
                          ? 'shadow-lg border-blue-300 rotate-2'
                          : 'hover:shadow-md'
                      }`}
                    >
                      {/* Drag Handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemove(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                        title="Anhang entfernen"
                      >
                        <X className="h-3 w-3" />
                      </button>

                      {/* Content */}
                      <div className="flex items-center space-x-3 ml-6">
                        <div className="flex-shrink-0">
                          {attachment.fileType.startsWith('image/') ? (
                            <img
                              src={attachment.url}
                              alt={attachment.fileName}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                              <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        {/* Order indicator */}
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DraggableAttachmentList;
