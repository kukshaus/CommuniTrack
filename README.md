# 📝 CommuniTrack

Eine moderne Web-Anwendung zur strukturierten Dokumentation von kommunikationsbezogenen Ereignissen mit einer Ex-Partnerin für rechtliche Zwecke.

## 🚀 Features

- ✍️ **Einfache Eintragserstellung** mit Titel, Datum, Beschreibung und Kategorien
- 📋 **Drag & Drop + Copy & Paste** für Bilder und Screenshots
- 📅 **Chronologische Timeline-Ansicht** aller Einträge
- 🔍 **Erweiterte Filter- und Suchfunktionen**
- 📄 **Export zu PDF, JSON und CSV** für rechtliche Zwecke
- 📱 **Mobile-First Responsive Design**
- 🛡️ **Sichere MongoDB-Datenspeicherung**

## 🛠️ Technologie-Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Datenbank:** MongoDB mit Docker
- **State Management:** Zustand
- **Export:** React-PDF, CSV-Export
- **UI:** Lucide Icons, responsive Design

## 📦 Installation & Setup

### 1. Repository klonen
```bash
git clone <repository-url>
cd CommuniTrack
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. MongoDB mit Docker starten
```bash
# MongoDB Container starten
docker-compose up -d mongodb

# Optional: MongoDB Express für Database Management
docker-compose up -d mongo-express
```

### 4. Umgebungsvariablen konfigurieren
```bash
# .env.local erstellen
cp env.template .env.local

# .env.local bearbeiten und MongoDB URI anpassen
MONGODB_URI=mongodb://admin:password@localhost:27017/communitrack
```

### 5. Anwendung starten
```bash
npm run dev
```

Die Anwendung ist nun unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 🗄️ Storage Options

The application supports multiple storage backends:

### 1. In-Memory Storage (Default/Demo)
- **No setup required** - perfect for testing and development
- Includes sample data for immediate testing
- Data is lost when the application restarts

### 2. MongoDB with Docker
```bash
docker-compose up -d mongodb
```

### 3. MongoDB Express (Optional)
```bash
docker-compose up -d mongo-express
```
MongoDB Express ist dann unter [http://localhost:8081](http://localhost:8081) verfügbar.

**Login Daten:**
- Username: admin
- Password: admin

### 4. Custom MongoDB
Edit `.env.local` with your MongoDB connection string:
```
MONGODB_URI=mongodb://your-connection-string
```

## 📊 Datenbankschema

### Entries Collection
```typescript
interface Entry {
  _id?: string;
  title: string;
  date: Date;
  description: string;
  category: 'konflikt' | 'gespraech' | 'verhalten' | 'beweis' | 'kindbetreuung' | 'sonstiges';
  attachments: Attachment[];
  tags: string[];
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Attachments Schema
```typescript
interface Attachment {
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnail?: string;
  context?: string;
  isImportant: boolean;
  uploadedAt: Date;
}
```

## 🔧 Verfügbare Scripts

```bash
# Entwicklungsserver starten
npm run dev

# Production Build erstellen
npm run build

# Production Server starten
npm start

# Linting
npm run lint

# Docker Services starten
docker-compose up -d

# Docker Services stoppen
docker-compose down

# Datenbank zurücksetzen
docker-compose down -v && docker-compose up -d
```

## 📱 Nutzung

### 1. Neuen Eintrag erstellen
- Klicken Sie auf "Neuer Eintrag"
- Füllen Sie alle erforderlichen Felder aus
- Laden Sie optional Bilder per Drag & Drop oder Copy & Paste hoch
- Speichern Sie den Eintrag

### 2. Einträge filtern und suchen
- Nutzen Sie die Suchleiste für schnelle Textsuche
- Verwenden Sie erweiterte Filter für Datum, Kategorie, Tags etc.
- Filtern Sie nach Einträgen mit/ohne Medien

### 3. Export für rechtliche Zwecke
- Klicken Sie auf "Export"
- Wählen Sie das gewünschte Format (PDF empfohlen)
- Konfigurieren Sie Optionen wie Zeitraum und Bildeinschluss
- Starten Sie den Export

## 🔒 Sicherheit & Datenschutz

- Alle Daten werden lokal in MongoDB gespeichert
- Keine Cloud-Synchronisation ohne explizite Konfiguration
- Bilder werden komprimiert vor der Speicherung
- Export-Passwortschutz verfügbar (bald)

## 🎨 Design-Prinzipien

- **Mobile First:** Optimiert für Smartphone-Nutzung
- **Zero Clutter:** Nur wesentliche Elemente sichtbar
- **Sofortige Reaktion:** Keine unnötigen Ladezeiten
- **Klarer Sprachstil:** Verständlich ohne juristische Fachbegriffe

## 🐛 Fehlerbehebung

### MongoDB Verbindungsfehler
```bash
# Prüfen ob Container läuft
docker ps

# Container neu starten
docker-compose restart mongodb

# Logs prüfen
docker-compose logs mongodb
```

### Next.js Build Fehler
```bash
# Cache löschen
rm -rf .next

# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Neu builden
npm run build
```

## 📄 Lizenz

Dieses Projekt ist für private Nutzung entwickelt. Bitte beachten Sie die lokalen Gesetze bezüglich Dokumentation und Datenschutz.

## 🤝 Beitragen

Dies ist ein privates Projekt für spezifische Anwendungsfälle. Für Verbesserungsvorschläge oder Bugs erstellen Sie bitte ein Issue.

## 📞 Support

Bei Fragen oder Problemen:
1. Prüfen Sie die Dokumentation
2. Schauen Sie in die Logs: `docker-compose logs`
3. Erstellen Sie ein Issue mit detaillierter Beschreibung
