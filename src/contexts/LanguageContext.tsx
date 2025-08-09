'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // App Header
    'app.title': 'CommuniTrack',
    'header.loggedInAs': 'Logged in as',
    'header.admin': 'Admin',
    'header.logout': 'Logout',
    'header.supportTitle': 'Support CommuniTrack',
    'header.settings': 'Settings',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Manage your communication records',
    'dashboard.export': 'Export',
    'dashboard.newEntry': 'New Entry',
    'dashboard.stats.total': 'Total Entries',
    'dashboard.stats.important': 'Important',
    'dashboard.stats.attachments': 'Attachments',
    'dashboard.stats.categories': 'Categories',
    'dashboard.noEntries.title': 'No entries found',
    'dashboard.noEntries.subtitle': 'Create your first entry or adjust your filters.',

    // Entry Form
    'entry.form.title.new': 'New Entry',
    'entry.form.title.edit': 'Edit Entry',
    'entry.form.titleLabel': 'Title',
    'entry.form.titlePlaceholder': 'Brief description of the communication...',
    'entry.form.dateLabel': 'Date',
    'entry.form.categoryLabel': 'Category',
    'entry.form.category.conflict': 'Conflict',
    'entry.form.category.conversation': 'Conversation',
    'entry.form.category.behavior': 'Behavior',
    'entry.form.category.evidence': 'Evidence',
    'entry.form.category.childcare': 'Childcare',
    'entry.form.category.other': 'Other',
    'entry.form.descriptionLabel': 'Description',
    'entry.form.descriptionPlaceholder': 'Detailed description of the incident, conversation, or event...',
    'entry.form.tagsLabel': 'Tags',
    'entry.form.tagsPlaceholder': 'Add tags separated by commas...',
    'entry.form.attachmentsLabel': 'Attachments',
    'entry.form.markImportant': 'Mark as Important',
    'entry.form.save': 'Save',
    'entry.form.cancel': 'Cancel',

    // Entry List & Details
    'entry.list.timeline': 'Timeline',
    'entry.details.title': 'Entry Details',
    'entry.details.created': 'Created',
    'entry.details.lastEdited': 'Last edited',
    'entry.details.attachments': 'Attachments',
    'entry.details.tags': 'Tags',
    'entry.details.metadata': 'Metadata',
    'entry.details.edit': 'Edit',
    'entry.details.share': 'Share',
    'entry.details.delete': 'Delete',
    'entry.details.confirmDelete': 'Are you sure you want to delete this entry?',

    // Share Dialog
    'share.title': 'Share Entry',
    'share.subtitle': 'Choose a sharing option',
    'share.preview': 'Preview',
    'share.systemShare': 'System Share',
    'share.email': 'Email',
    'share.whatsapp': 'WhatsApp',
    'share.sms': 'SMS',
    'share.copyClipboard': 'Copy to Clipboard',
    'share.copyClipboard.success': 'Copied to clipboard!',
    'share.copyLink': 'Copy Link',
    'share.copyLink.success': 'Link copied!',
    'share.downloadText': 'Download as Text File',
    'share.tip': '💡 Tip: The entry will be shared including all metadata',

    // Filter Bar
    'filter.all': 'All',
    'filter.important': 'Important',
    'filter.search': 'Search entries...',
    'filter.category': 'Category',
    'filter.dateRange': 'Date Range',
    'filter.tags': 'Tags',
    'filter.clear': 'Clear Filters',
    'filter.results': '{count} entries found',

    // Export Dialog
    'export.title': 'Export Entries',
    'export.subtitle': 'Choose export format and options',
    'export.format': 'Format',
    'export.format.html': 'HTML Report',
    'export.format.pdf': 'PDF Document',
    'export.format.csv': 'CSV Spreadsheet',
    'export.dateRange': 'Date Range',
    'export.categories': 'Categories',
    'export.includeAttachments': 'Include Attachments',
    'export.onlyImportant': 'Only Important Entries',
    'export.start': 'Start Export',
    'export.cancel': 'Cancel',

    // File Upload
    'upload.dragDrop': 'Drag and drop files here, or',
    'upload.selectFiles': 'select files',
    'upload.supportedFormats': 'Supported formats: Images, PDF, Documents',
    'upload.maxSize': 'Maximum file size: 10 MB',
    'upload.uploading': 'Uploading...',
    'upload.success': 'Upload successful',
    'upload.error': 'Upload failed',

    // Settings
    'settings.title': 'Settings',
    'settings.profile.title': 'Profile',
    'settings.profile.name': 'Full Name',
    'settings.profile.username': 'Username',
    'settings.security.title': 'Security',
    'settings.security.currentPassword': 'Current Password',
    'settings.security.newPassword': 'New Password',
    'settings.security.confirmPassword': 'Confirm New Password',
    'settings.security.optional': 'Optional',
    'settings.security.hint': 'Leave fields empty if you don\'t want to change your password',
    'settings.security.clearFields': 'Clear Password Fields',
    'settings.language.title': 'Language',
    'settings.language.select': 'Select Language',
    'settings.language.english': 'English',
    'settings.language.german': 'German',
    'settings.account.title': 'Account Information',
    'settings.account.memberSince': 'Member since',
    'settings.account.lastLogin': 'Last login',
    'settings.save': 'Save Changes',
    'settings.saving': 'Saving...',
    'settings.success': 'Settings saved successfully!',
    'settings.error': 'Error saving settings',

    // Upsell content
    'upsell.tagline': 'Your secure solution for professional communication documentation',
    'upsell.legal.title': 'Legally Secure Documentation',
    'upsell.legal.description': 'Document important conversations, conflicts, and events with timestamps and evidence for legal protection.',
    'upsell.security.title': 'Privacy & Security',
    'upsell.security.description': 'Your sensitive data is protected by state-of-the-art encryption and remains completely private and confidential.',
    'upsell.organization.title': 'Smart Organization',
    'upsell.organization.description': 'Categorize, tag, and search your entries effortlessly. Export reports for lawyers or authorities.',
    'upsell.multimedia.title': 'Multimedia Evidence',
    'upsell.multimedia.description': 'Add photos, videos, audio recordings, and documents as evidence to your entries.',
    'upsell.ideal.title': 'Perfect for:',
    'upsell.ideal.workplace': '• Workplace conflicts and bullying',
    'upsell.ideal.neighborhood': '• Neighborhood disputes',
    'upsell.ideal.family': '• Family and custody matters',
    'upsell.ideal.business': '• Business communication',
    'upsell.ideal.rental': '• Rental law disputes',

    // Login & Register
    'login.title': 'Sign In',
    'login.subtitle': 'Welcome back',
    'register.title': 'Create Account',
    'register.subtitle': 'Start secure documentation',
    'form.name': 'Your Name',
    'form.name.placeholder': 'Full Name',
    'form.username': 'Username',
    'form.username.placeholder.login': 'Enter username',
    'form.username.placeholder.register': 'Choose username',
    'form.password': 'Password',
    'form.password.placeholder.login': 'Enter password',
    'form.password.placeholder.register': 'At least 6 characters',
    'form.confirmPassword': 'Confirm Password',
    'form.confirmPassword.placeholder': 'Repeat password',
    'button.login': 'Sign In',
    'button.register': 'Create Account',
    'button.login.loading': 'Signing in...',
    'button.register.loading': 'Creating...',
    'toggle.toRegister': 'No account yet? Register here',
    'toggle.toLogin': 'Already have an account? Sign in here',

    // Errors & Validation
    'error.invalidCredentials': 'Invalid credentials',
    'error.passwordMismatch': 'Passwords do not match',
    'error.passwordTooShort': 'Password must be at least 6 characters long',
    'error.fillAllFields': 'Please fill in all fields',
    'error.usernameExists': 'Username already taken',
    'error.general': 'An error occurred',
    'error.usernameInvalid': 'Username is already taken',
    'error.currentPasswordWrong': 'Current password is incorrect',
    'error.serverError': 'Internal server error',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.select': 'Select',
    'common.upload': 'Upload',
    'common.download': 'Download',
    'common.share': 'Share',
    'common.copy': 'Copy',
    'common.important': 'Important',
    'common.optional': 'Optional',

    // Image Gallery
    'gallery.close': 'Close Gallery',
    'gallery.previous': 'Previous Image',
    'gallery.next': 'Next Image',
    'gallery.grid': 'Grid View',
    'gallery.zoom': 'Zoom',
    'gallery.download': 'Download',
    'gallery.of': 'of',

    // Footer
    'footer.text': 'CommuniTrack - Secure Communication Documentation',
  },
  de: {
    // App Header
    'app.title': 'CommuniTrack',
    'header.loggedInAs': 'Angemeldet als',
    'header.admin': 'Admin',
    'header.logout': 'Abmelden',
    'header.supportTitle': 'CommuniTrack unterstützen',
    'header.settings': 'Einstellungen',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Verwalten Sie Ihre Kommunikationsverläufe',
    'dashboard.export': 'Export',
    'dashboard.newEntry': 'Neuer Eintrag',
    'dashboard.stats.total': 'Einträge gesamt',
    'dashboard.stats.important': 'Wichtig',
    'dashboard.stats.attachments': 'Anhänge',
    'dashboard.stats.categories': 'Kategorien',
    'dashboard.noEntries.title': 'Keine Einträge gefunden',
    'dashboard.noEntries.subtitle': 'Erstellen Sie Ihren ersten Eintrag oder passen Sie Ihre Filter an.',

    // Entry Form
    'entry.form.title.new': 'Neuer Eintrag',
    'entry.form.title.edit': 'Eintrag bearbeiten',
    'entry.form.titleLabel': 'Titel',
    'entry.form.titlePlaceholder': 'Kurze Beschreibung der Kommunikation...',
    'entry.form.dateLabel': 'Datum',
    'entry.form.categoryLabel': 'Kategorie',
    'entry.form.category.conflict': 'Konflikt',
    'entry.form.category.conversation': 'Gespräch',
    'entry.form.category.behavior': 'Verhalten',
    'entry.form.category.evidence': 'Beweis',
    'entry.form.category.childcare': 'Kinderbetreuung',
    'entry.form.category.other': 'Sonstiges',
    'entry.form.descriptionLabel': 'Beschreibung',
    'entry.form.descriptionPlaceholder': 'Detaillierte Beschreibung des Vorfalls, Gesprächs oder Ereignisses...',
    'entry.form.tagsLabel': 'Tags',
    'entry.form.tagsPlaceholder': 'Tags durch Kommas getrennt hinzufügen...',
    'entry.form.attachmentsLabel': 'Anhänge',
    'entry.form.markImportant': 'Als wichtig markieren',
    'entry.form.save': 'Speichern',
    'entry.form.cancel': 'Abbrechen',

    // Entry List & Details
    'entry.list.timeline': 'Zeitleiste',
    'entry.details.title': 'Eintrag Details',
    'entry.details.created': 'Erstellt',
    'entry.details.lastEdited': 'Zuletzt bearbeitet',
    'entry.details.attachments': 'Anhänge',
    'entry.details.tags': 'Tags',
    'entry.details.metadata': 'Metadaten',
    'entry.details.edit': 'Bearbeiten',
    'entry.details.share': 'Teilen',
    'entry.details.delete': 'Löschen',
    'entry.details.confirmDelete': 'Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?',

    // Share Dialog
    'share.title': 'Eintrag teilen',
    'share.subtitle': 'Wählen Sie eine Teilen-Option',
    'share.preview': 'Vorschau',
    'share.systemShare': 'System-Teilen',
    'share.email': 'E-Mail',
    'share.whatsapp': 'WhatsApp',
    'share.sms': 'SMS',
    'share.copyClipboard': 'In Zwischenablage kopieren',
    'share.copyClipboard.success': 'In Zwischenablage kopiert!',
    'share.copyLink': 'Link kopieren',
    'share.copyLink.success': 'Link kopiert!',
    'share.downloadText': 'Als Textdatei herunterladen',
    'share.tip': '💡 Tipp: Der Eintrag wird inklusive aller Metadaten formatiert geteilt',

    // Filter Bar
    'filter.all': 'Alle',
    'filter.important': 'Wichtig',
    'filter.search': 'Einträge durchsuchen...',
    'filter.category': 'Kategorie',
    'filter.dateRange': 'Zeitraum',
    'filter.tags': 'Tags',
    'filter.clear': 'Filter löschen',
    'filter.results': '{count} Einträge gefunden',

    // Export Dialog
    'export.title': 'Einträge exportieren',
    'export.subtitle': 'Wählen Sie Exportformat und Optionen',
    'export.format': 'Format',
    'export.format.html': 'HTML-Bericht',
    'export.format.pdf': 'PDF-Dokument',
    'export.format.csv': 'CSV-Tabelle',
    'export.dateRange': 'Zeitraum',
    'export.categories': 'Kategorien',
    'export.includeAttachments': 'Anhänge einschließen',
    'export.onlyImportant': 'Nur wichtige Einträge',
    'export.start': 'Export starten',
    'export.cancel': 'Abbrechen',

    // File Upload
    'upload.dragDrop': 'Dateien hier hineinziehen oder',
    'upload.selectFiles': 'Dateien auswählen',
    'upload.supportedFormats': 'Unterstützte Formate: Bilder, PDF, Dokumente',
    'upload.maxSize': 'Maximale Dateigröße: 10 MB',
    'upload.uploading': 'Wird hochgeladen...',
    'upload.success': 'Upload erfolgreich',
    'upload.error': 'Upload fehlgeschlagen',

    // Settings
    'settings.title': 'Einstellungen',
    'settings.profile.title': 'Profil',
    'settings.profile.name': 'Vollständiger Name',
    'settings.profile.username': 'Benutzername',
    'settings.security.title': 'Sicherheit',
    'settings.security.currentPassword': 'Aktuelles Passwort',
    'settings.security.newPassword': 'Neues Passwort',
    'settings.security.confirmPassword': 'Neues Passwort bestätigen',
    'settings.security.optional': 'Optional',
    'settings.security.hint': 'Lassen Sie die Felder leer, wenn Sie Ihr Passwort nicht ändern möchten',
    'settings.security.clearFields': 'Passwort-Felder leeren',
    'settings.language.title': 'Sprache',
    'settings.language.select': 'Sprache auswählen',
    'settings.language.english': 'Englisch',
    'settings.language.german': 'Deutsch',
    'settings.account.title': 'Kontoinformationen',
    'settings.account.memberSince': 'Mitglied seit',
    'settings.account.lastLogin': 'Letzter Login',
    'settings.save': 'Änderungen speichern',
    'settings.saving': 'Wird gespeichert...',
    'settings.success': 'Einstellungen erfolgreich gespeichert!',
    'settings.error': 'Fehler beim Speichern der Einstellungen',
    
    // Upsell content
    'upsell.tagline': 'Ihre sichere Lösung für professionelle Kommunikationsdokumentation',
    'upsell.legal.title': 'Rechtssichere Dokumentation',
    'upsell.legal.description': 'Dokumentieren Sie wichtige Gespräche, Konflikte und Ereignisse mit Zeitstempel und Beweismitteln für rechtliche Absicherung.',
    'upsell.security.title': 'Datenschutz & Sicherheit',
    'upsell.security.description': 'Ihre sensiblen Daten sind durch modernste Verschlüsselung geschützt und bleiben vollständig privat und vertraulich.',
    'upsell.organization.title': 'Intelligente Organisation',
    'upsell.organization.description': 'Kategorisieren, taggen und durchsuchen Sie Ihre Einträge mühelos. Exportieren Sie Berichte für Anwälte oder Behörden.',
    'upsell.multimedia.title': 'Multimedia-Beweise',
    'upsell.multimedia.description': 'Fügen Sie Fotos, Videos, Audio-Aufnahmen und Dokumente als Beweismittel zu Ihren Einträgen hinzu.',
    'upsell.ideal.title': 'Ideal für:',
    'upsell.ideal.workplace': '• Arbeitsplatz-Konflikte und Mobbing',
    'upsell.ideal.neighborhood': '• Nachbarschaftsstreitigkeiten',
    'upsell.ideal.family': '• Familien- und Sorgerechtsangelegenheiten',
    'upsell.ideal.business': '• Geschäftliche Kommunikation',
    'upsell.ideal.rental': '• Mietrechtliche Auseinandersetzungen',
    
    // Login & Register
    'login.title': 'Anmelden',
    'login.subtitle': 'Willkommen zurück',
    'register.title': 'Konto erstellen',
    'register.subtitle': 'Beginnen Sie mit der sicheren Dokumentation',
    'form.name': 'Ihr Name',
    'form.name.placeholder': 'Vollständiger Name',
    'form.username': 'Benutzername',
    'form.username.placeholder.login': 'Benutzername eingeben',
    'form.username.placeholder.register': 'Benutzername wählen',
    'form.password': 'Passwort',
    'form.password.placeholder.login': 'Passwort eingeben',
    'form.password.placeholder.register': 'Mindestens 6 Zeichen',
    'form.confirmPassword': 'Passwort bestätigen',
    'form.confirmPassword.placeholder': 'Passwort wiederholen',
    'button.login': 'Anmelden',
    'button.register': 'Konto erstellen',
    'button.login.loading': 'Anmelden...',
    'button.register.loading': 'Wird erstellt...',
    'toggle.toRegister': 'Noch kein Konto? Hier registrieren',
    'toggle.toLogin': 'Bereits ein Konto? Hier anmelden',
    
    // Errors & Validation
    'error.invalidCredentials': 'Ungültige Anmeldedaten',
    'error.passwordMismatch': 'Passwörter stimmen nicht überein',
    'error.passwordTooShort': 'Passwort muss mindestens 6 Zeichen lang sein',
    'error.fillAllFields': 'Bitte alle Felder ausfüllen',
    'error.usernameExists': 'Benutzername bereits vergeben',
    'error.general': 'Ein Fehler ist aufgetreten',
    'error.usernameInvalid': 'Benutzername ist bereits vergeben',
    'error.currentPasswordWrong': 'Aktuelles Passwort ist falsch',
    'error.serverError': 'Interner Server-Fehler',

    // Common
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',
    'common.loading': 'Laden...',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    'common.ok': 'OK',
    'common.search': 'Suchen',
    'common.filter': 'Filter',
    'common.clear': 'Löschen',
    'common.select': 'Auswählen',
    'common.upload': 'Hochladen',
    'common.download': 'Herunterladen',
    'common.share': 'Teilen',
    'common.copy': 'Kopieren',
    'common.important': 'Wichtig',
    'common.optional': 'Optional',

    // Image Gallery
    'gallery.close': 'Galerie schließen',
    'gallery.previous': 'Vorheriges Bild',
    'gallery.next': 'Nächstes Bild',
    'gallery.grid': 'Rasteransicht',
    'gallery.zoom': 'Zoom',
    'gallery.download': 'Herunterladen',
    'gallery.of': 'von',
    
    // Footer
    'footer.text': 'CommuniTrack - Sichere Kommunikationsdokumentation',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en'); // English as default
  const { user } = useStore();

  // Load language from user data when user is available
  useEffect(() => {
    if (user && user.language) {
      setLanguage(user.language);
    } else if (typeof window !== 'undefined') {
      // Fallback to localStorage if user data not available yet
      const savedLanguage = localStorage.getItem('communitrack-language') as Language;
      if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
        setLanguage(savedLanguage);
      }
    }
  }, [user]);

  // Save language to localStorage when it changes (as backup)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('communitrack-language', language);
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
