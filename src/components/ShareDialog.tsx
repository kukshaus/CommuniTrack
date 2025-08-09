import React, { useState } from 'react';
import { 
  Share, 
  Mail, 
  MessageCircle, 
  Copy, 
  X, 
  Check,
  Phone,
  Link,
  Download,
  FileText
} from 'lucide-react';
import { Entry } from '@/types';
import { formatDate } from '@/lib/utils';
import Button from './ui/Button';

interface ShareDialogProps {
  entry: Entry;
  isOpen: boolean;
  onClose: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ entry, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState<string | null>(null);

  // Format entry content for sharing
  const formatEntryForSharing = (includeAttachments = true) => {
    const date = formatDate(entry.date);
    const importance = entry.isImportant ? ' ⭐ WICHTIG' : '';
    const category = entry.category.charAt(0).toUpperCase() + entry.category.slice(1);
    const tags = entry.tags.length > 0 ? `\nTags: ${entry.tags.join(', ')}` : '';
    const attachmentsInfo = includeAttachments && entry.attachments.length > 0 
      ? `\nAnhänge: ${entry.attachments.length} Datei(en)` 
      : '';

    return `📋 ${entry.title}${importance}

📅 Datum: ${date}
📂 Kategorie: ${category}

📝 Beschreibung:
${entry.description}${tags}${attachmentsInfo}

---
Erstellt mit CommuniTrack`;
  };

  const getShareUrl = () => {
    // In a real app, this would be a proper URL to view the entry
    // For now, we'll use a placeholder that could be implemented later
    return `${window.location.origin}/entry/${entry._id}`;
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = formatEntryForSharing();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formatEntryForSharing();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`CommuniTrack Eintrag: ${entry.title}`);
    const body = encodeURIComponent(formatEntryForSharing());
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
    setShareMethod('email');
    setTimeout(() => setShareMethod(null), 1000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(formatEntryForSharing());
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    setShareMethod('whatsapp');
    setTimeout(() => setShareMethod(null), 1000);
  };

  const handleSMSShare = () => {
    const text = encodeURIComponent(formatEntryForSharing(false)); // Shorter for SMS
    const smsUrl = `sms:?body=${text}`;
    window.open(smsUrl, '_blank');
    setShareMethod('sms');
    setTimeout(() => setShareMethod(null), 1000);
  };

  const handleLinkShare = async () => {
    try {
      const url = getShareUrl();
      await navigator.clipboard.writeText(url);
      setShareMethod('link');
      setTimeout(() => setShareMethod(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleNativeShare = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: `CommuniTrack Eintrag: ${entry.title}`,
          text: formatEntryForSharing(),
          url: getShareUrl(),
        });
        setShareMethod('native');
        setTimeout(() => setShareMethod(null), 1000);
      } catch (error) {
        console.error('Native sharing failed:', error);
      }
    }
  };

  const handleDownloadAsText = () => {
    const content = formatEntryForSharing();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date(entry.date).toISOString().split('T')[0]; // YYYY-MM-DD format
    link.download = `CommuniTrack_${entry.title.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShareMethod('download');
    setTimeout(() => setShareMethod(null), 1000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10001]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Share className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Eintrag teilen</h3>
              <p className="text-sm text-gray-600">Wählen Sie eine Teilen-Option</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Entry Preview */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${entry.isImportant ? 'bg-yellow-500' : 'bg-gray-300'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">{entry.title}</h4>
              <p className="text-xs text-gray-600 mt-1">
                {formatDate(entry.date)} • {entry.category}
                {entry.attachments.length > 0 && (
                  <span className="ml-2">📎 {entry.attachments.length}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-6 space-y-3">
          {/* Native Share (if available) */}
          {'share' in navigator && (
            <Button
              variant="outline"
              onClick={handleNativeShare}
              className="w-full justify-start space-x-3 h-12 hover:bg-blue-50 hover:border-blue-200"
              disabled={shareMethod === 'native'}
            >
              <Share className="h-5 w-5 text-blue-600" />
              <span className="flex-1 text-left">System-Teilen</span>
              {shareMethod === 'native' && <Check className="h-4 w-4 text-green-600" />}
            </Button>
          )}

          {/* Email */}
          <Button
            variant="outline"
            onClick={handleEmailShare}
            className="w-full justify-start space-x-3 h-12 hover:bg-red-50 hover:border-red-200"
            disabled={shareMethod === 'email'}
          >
            <Mail className="h-5 w-5 text-red-600" />
            <span className="flex-1 text-left">E-Mail</span>
            {shareMethod === 'email' && <Check className="h-4 w-4 text-green-600" />}
          </Button>

          {/* WhatsApp */}
          <Button
            variant="outline"
            onClick={handleWhatsAppShare}
            className="w-full justify-start space-x-3 h-12 hover:bg-green-50 hover:border-green-200"
            disabled={shareMethod === 'whatsapp'}
          >
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span className="flex-1 text-left">WhatsApp</span>
            {shareMethod === 'whatsapp' && <Check className="h-4 w-4 text-green-600" />}
          </Button>

          {/* SMS */}
          <Button
            variant="outline"
            onClick={handleSMSShare}
            className="w-full justify-start space-x-3 h-12 hover:bg-blue-50 hover:border-blue-200"
            disabled={shareMethod === 'sms'}
          >
            <Phone className="h-5 w-5 text-blue-600" />
            <span className="flex-1 text-left">SMS</span>
            {shareMethod === 'sms' && <Check className="h-4 w-4 text-green-600" />}
          </Button>

          {/* Copy to Clipboard */}
          <Button
            variant="outline"
            onClick={handleCopyToClipboard}
            className="w-full justify-start space-x-3 h-12 hover:bg-gray-50 hover:border-gray-300"
            disabled={copied}
          >
            <Copy className="h-5 w-5 text-gray-600" />
            <span className="flex-1 text-left">
              {copied ? 'In Zwischenablage kopiert!' : 'In Zwischenablage kopieren'}
            </span>
            {copied && <Check className="h-4 w-4 text-green-600" />}
          </Button>

          {/* Copy Link */}
          <Button
            variant="outline"
            onClick={handleLinkShare}
            className="w-full justify-start space-x-3 h-12 hover:bg-purple-50 hover:border-purple-200"
            disabled={shareMethod === 'link'}
          >
            <Link className="h-5 w-5 text-purple-600" />
            <span className="flex-1 text-left">
              {shareMethod === 'link' ? 'Link kopiert!' : 'Link kopieren'}
            </span>
            {shareMethod === 'link' && <Check className="h-4 w-4 text-green-600" />}
          </Button>

          {/* Download as Text */}
          <Button
            variant="outline"
            onClick={handleDownloadAsText}
            className="w-full justify-start space-x-3 h-12 hover:bg-indigo-50 hover:border-indigo-200"
            disabled={shareMethod === 'download'}
          >
            <FileText className="h-5 w-5 text-indigo-600" />
            <span className="flex-1 text-left">Als Textdatei herunterladen</span>
            {shareMethod === 'download' && <Check className="h-4 w-4 text-green-600" />}
          </Button>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <p className="text-xs text-gray-500 text-center">
            💡 Tipp: Der Eintrag wird inklusive aller Metadaten formatiert geteilt
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
