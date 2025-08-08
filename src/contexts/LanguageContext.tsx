'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  de: {
    // Header
    'app.title': 'CommuniTrack',
    'login.title': 'Anmelden',
    'register.title': 'Konto erstellen',
    'login.subtitle': 'Willkommen zurück',
    'register.subtitle': 'Beginnen Sie mit der sicheren Dokumentation',
    
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
    
    // Form fields
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
    
    // Buttons
    'button.login': 'Anmelden',
    'button.register': 'Konto erstellen',
    'button.login.loading': 'Anmelden...',
    'button.register.loading': 'Wird erstellt...',
    
    // Toggle links
    'toggle.toRegister': 'Noch kein Konto? Hier registrieren',
    'toggle.toLogin': 'Bereits ein Konto? Hier anmelden',
    
    // Footer
    'footer.text': 'CommuniTrack - Sichere Kommunikationsdokumentation',
    
    // Errors
    'error.invalidCredentials': 'Ungültige Anmeldedaten',
    'error.passwordMismatch': 'Passwörter stimmen nicht überein',
    'error.passwordTooShort': 'Passwort muss mindestens 6 Zeichen lang sein',
    'error.fillAllFields': 'Bitte alle Felder ausfüllen',
    'error.usernameExists': 'Benutzername bereits vergeben',
    'error.general': 'Ein Fehler ist aufgetreten',
  },
  en: {
    // Header
    'app.title': 'CommuniTrack',
    'login.title': 'Sign In',
    'register.title': 'Create Account',
    'login.subtitle': 'Welcome back',
    'register.subtitle': 'Start secure documentation',
    
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
    
    // Form fields
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
    
    // Buttons
    'button.login': 'Sign In',
    'button.register': 'Create Account',
    'button.login.loading': 'Signing in...',
    'button.register.loading': 'Creating...',
    
    // Toggle links
    'toggle.toRegister': 'No account yet? Register here',
    'toggle.toLogin': 'Already have an account? Sign in here',
    
    // Footer
    'footer.text': 'CommuniTrack - Secure Communication Documentation',
    
    // Errors
    'error.invalidCredentials': 'Invalid credentials',
    'error.passwordMismatch': 'Passwords do not match',
    'error.passwordTooShort': 'Password must be at least 6 characters long',
    'error.fillAllFields': 'Please fill in all fields',
    'error.usernameExists': 'Username already taken',
    'error.general': 'An error occurred',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('de');

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('communitrack-language') as Language;
      if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  // Save language to localStorage when it changes
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
