# CommuniTrack

Eine moderne Web-App zur privaten Dokumentation, Organisation und Export von kommunikationsbezogenen Ereignissen.

## 🚀 Features

- **📝 Eintragsverwaltung**: Erstellen, bearbeiten und organisieren von Ereignissen mit Titel, Beschreibung, Datum und Kategorien
- **🏷️ Kategorisierung**: Vordefinierte Kategorien (Konflikt, Gespräch, Verhalten, Beweis, Kindbetreuung, etc.)
- **📎 Datei-Upload**: Drag & Drop und Copy-Paste Unterstützung für Bilder und Dokumente
- **🔍 Filter & Suche**: Umfangreiche Filter- und Suchfunktionen nach Zeitraum, Kategorie, Tags und mehr
- **📄 Export-Funktionen**: PDF, JSON und CSV Export mit verschiedenen Optionen
- **⭐ Wichtige Einträge**: Markierung wichtiger Ereignisse
- **🏷️ Tagging-System**: Flexible Tag-Verwaltung für bessere Organisation
- **📱 Responsive Design**: Mobile-first Design für alle Geräte
- **🔐 Sichere Authentifizierung**: Benutzer-Login mit Supabase Auth
- **☁️ Cloud-Speicherung**: Verschlüsselte Datenspeicherung mit Supabase

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS mit Custom Design System
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **File Upload**: React Dropzone mit Copy-Paste Support
- **Export**: jsPDF, FileSaver.js
- **Icons**: Lucide React

## 📦 Installation

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase Account

### 1. Repository klonen

\`\`\`bash
git clone <repository-url>
cd communitrack
\`\`\`

### 2. Dependencies installieren

\`\`\`bash
npm install
\`\`\`

### 3. Supabase Setup

1. Erstellen Sie ein neues Projekt auf [supabase.com](https://supabase.com)
2. Führen Sie das SQL-Schema aus \`supabase_schema.sql\` in Ihrem Supabase SQL Editor aus
3. Erstellen Sie einen Storage Bucket namens "attachments"
4. Kopieren Sie Ihre Supabase URL und anon key

### 4. Umgebungsvariablen

Erstellen Sie eine \`.env.local\` Datei:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 5. Entwicklungsserver starten

\`\`\`bash
npm run dev
\`\`\`

Die App ist nun unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 📋 Erste Schritte

1. **Registrierung**: Erstellen Sie ein neues Benutzerkonto
2. **Erster Eintrag**: Klicken Sie auf "Neuer Eintrag" um Ihr erstes Ereignis zu dokumentieren
3. **Dateien hinzufügen**: Verwenden Sie Drag & Drop oder Copy-Paste um Bilder und Dokumente hinzuzufügen
4. **Organisieren**: Nutzen Sie Kategorien und Tags zur besseren Organisation
5. **Exportieren**: Exportieren Sie Ihre Daten als PDF für rechtliche Zwecke

## 🗂️ Dateistruktur

\`\`\`
src/
├── app/                    # Next.js App Router
├── components/             # React Komponenten
│   ├── ui/                # Basis UI Komponenten
│   ├── AuthPage.tsx       # Authentifizierung
│   ├── Dashboard.tsx      # Haupt-Dashboard
│   ├── EntryForm.tsx      # Formular für Einträge
│   ├── EntryList.tsx      # Liste der Einträge
│   ├── FilterBar.tsx      # Filter-Komponente
│   ├── FileUpload.tsx     # Datei-Upload mit Drag & Drop
│   └── ExportDialog.tsx   # Export-Dialog
├── hooks/                 # Custom React Hooks
├── lib/                   # Utility-Funktionen
├── store/                 # Zustand Store
└── types/                 # TypeScript Definitionen
\`\`\`

## 🔧 Konfiguration

### Supabase Policies

Die App verwendet Row Level Security (RLS). Alle notwendigen Policies sind im \`supabase_schema.sql\` enthalten.

### Storage Setup

1. Gehen Sie zu Storage in Ihrem Supabase Dashboard
2. Erstellen Sie einen neuen Bucket namens "attachments"
3. Setzen Sie den Bucket auf "Private"
4. Die notwendigen Storage Policies sind bereits im Schema enthalten

## 📱 Mobile Optimierung

Die App ist vollständig responsive und wurde mobile-first entwickelt:

- Touch-freundliche Bedienelemente
- Optimierte Layouts für kleine Bildschirme
- Copy-Paste Unterstützung auf mobilen Geräten
- Schnelle Ladezeiten

## 🔒 Sicherheit & Datenschutz

- **Row Level Security**: Benutzer sehen nur ihre eigenen Daten
- **Sichere Authentifizierung**: E-Mail/Passwort mit Supabase Auth
- **Verschlüsselte Übertragung**: HTTPS für alle Requests
- **Private Storage**: Dateien sind nur für den Benutzer zugänglich
- **No-Index**: App wird nicht von Suchmaschinen indexiert

## 📄 Export-Funktionen

### PDF Export
- Vollständiger Export aller Einträge
- Chronologische Sortierung
- Inklusive Metadaten und Anhang-Listen
- Professionelles Layout für rechtliche Zwecke

### JSON Export
- Vollständige Datenstruktur
- Inklusive aller Metadaten
- Maschinenlesbar für weitere Verarbeitung

### CSV Export
- Tabellarische Darstellung
- Import in Excel/Google Sheets möglich
- Für statistische Auswertungen

## 🚀 Deployment

### Vercel (Empfohlen)

1. Repository auf GitHub/GitLab pushen
2. Projekt mit Vercel verbinden
3. Umgebungsvariablen in Vercel setzen
4. Automatisches Deployment

### Andere Plattformen

Die App kann auf jeder Node.js-kompatiblen Plattform deployed werden:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Beitragen

Da es sich um eine private Dokumentations-App handelt, sind externe Beiträge nicht vorgesehen. Der Code dient als Referenz-Implementierung.

## 📄 Lizenz

Private Nutzung - Alle Rechte vorbehalten.

## 🆘 Support

Bei technischen Problemen:

1. Überprüfen Sie die Supabase-Konfiguration
2. Kontrollieren Sie die Umgebungsvariablen
3. Schauen Sie in die Browser-Konsole für Fehlermeldungen
4. Überprüfen Sie die Supabase Logs

## ⚠️ Wichtige Hinweise

- **Backup**: Regelmäßige Exports als Backup empfohlen
- **Browser**: Moderne Browser (Chrome, Firefox, Safari, Edge) erforderlich
- **JavaScript**: JavaScript muss aktiviert sein
- **Storage**: Dateigröße pro Upload auf 10MB begrenzt

---

**CommuniTrack** - Ihre private Dokumentationslösung für wichtige Kommunikationsereignisse.
