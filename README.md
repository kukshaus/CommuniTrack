# CommuniTrack

Eine moderne Web-Anwendung zur **Dokumentation, Organisation und Export** von kommunikationsbezogenen Ereignissen mit einer Ex-Partnerin oder anderen wichtigen Personen. CommuniTrack hilft dabei, wichtige Gespräche, Konflikte und Beweise rechtssicher zu dokumentieren.

## 🚀 Features

### ✅ MVP Features (implementiert)
- **Benutzerauthentifizierung** - Sichere Anmeldung und Registrierung
- **Eintragsverwaltung** - Erstellen, bearbeiten und löschen von Einträgen
- **Kategorisierung** - Einträge nach Kategorien organisieren (Konflikt, Gespräch, Verhalten, etc.)
- **Medienhandling** - Drag & Drop und Copy/Paste für Bilder
- **Chronologische Ansicht** - Zeitgesteuerte Darstellung aller Einträge
- **Erweiterte Filterung** - Nach Kategorie, Datum, Stichwörtern und mehr filtern
- **Export-Funktionen** - PDF, JSON und CSV Export für rechtliche Zwecke

### 🔧 Technische Features
- **Mobile First** - Responsive Design für alle Geräte
- **Schnelle Performance** - Optimiert für sofortige Reaktionen
- **Sichere Datenspeicherung** - Verschlüsselte Cloud-Speicherung mit Supabase
- **Moderne UI** - Minimalistische, ablenkungsfreie Benutzeroberfläche
- **Offline-fähig** - Lokale Speicherung für bessere Performance

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod Validation
- **PDF Generation**: pdf-lib
- **Deployment**: Vercel-ready

## 📦 Installation

### Voraussetzungen
- Node.js 18+
- npm oder yarn
- Supabase Account

### 1. Repository klonen
```bash
git clone <repository-url>
cd CommuniTrack
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen einrichten
```bash
cp .env.local.example .env.local
```

Bearbeiten Sie `.env.local` mit Ihren Supabase-Credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Supabase Datenbank einrichten

1. Erstellen Sie ein neues Supabase Projekt
2. Führen Sie das SQL-Schema aus der Datei `supabase_schema.sql` in der Supabase SQL-Konsole aus
3. Aktivieren Sie Row Level Security (RLS) in den Supabase-Einstellungen

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Die App läuft dann unter [http://localhost:3000](http://localhost:3000).

## 🏗 Projektstruktur

```
src/
├── app/                    # Next.js App Router
├── components/             # React-Komponenten
│   ├── ui/                # Wiederverwendbare UI-Komponenten
│   ├── AuthPage.tsx       # Authentifizierung
│   ├── Dashboard.tsx      # Hauptdashboard
│   ├── EntryForm.tsx      # Eintragsformular
│   ├── EntryList.tsx      # Eintragsliste
│   ├── FilterBar.tsx      # Filterkomponente
│   └── ExportDialog.tsx   # Export-Dialog
├── hooks/                 # Custom React Hooks
├── lib/                   # Utilities und Konfiguration
├── store/                 # Zustand Store
├── types/                 # TypeScript Definitionen
└── styles/               # CSS Dateien
```

## 📱 Verwendung

### Ersten Eintrag erstellen
1. Registrieren Sie sich oder melden Sie sich an
2. Klicken Sie auf "Neuer Eintrag"
3. Füllen Sie alle erforderlichen Felder aus
4. Fügen Sie optional Bilder per Drag & Drop oder Copy/Paste hinzu
5. Speichern Sie den Eintrag

### Einträge filtern und suchen
- Nutzen Sie die Suchleiste für Volltext-Suche
- Filtern Sie nach Kategorie, Datum oder Wichtigkeit
- Kombinieren Sie mehrere Filter für präzise Ergebnisse

### Daten exportieren
1. Klicken Sie auf "Export" in der oberen Navigation
2. Wählen Sie das gewünschte Format (PDF, JSON, CSV)
3. Konfigurieren Sie die Export-Optionen
4. Laden Sie die generierte Datei herunter

## 🔒 Sicherheit

- **Row Level Security (RLS)** - Jeder Benutzer kann nur seine eigenen Daten sehen
- **Sichere Authentifizierung** - Passwort-basiert mit Supabase Auth
- **Verschlüsselte Speicherung** - Alle Daten werden verschlüsselt in der Cloud gespeichert
- **DSGVO-konform** - Datenschutz nach europäischen Standards

## 🚀 Deployment

### Vercel (empfohlen)
1. Pushen Sie den Code zu GitHub
2. Verbinden Sie Ihr Repository mit Vercel
3. Fügen Sie Ihre Umgebungsvariablen in Vercel hinzu
4. Deploy!

### Andere Plattformen
Die App kann auf jeder Node.js-fähigen Plattform deployed werden:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Railway

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushen Sie den Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie einen Pull Request

## 📞 Support

Bei Fragen oder Problemen:
- Öffnen Sie ein [GitHub Issue](issues)
- Kontaktieren Sie den Entwickler

## 🗺 Roadmap

### Nächste Features
- [ ] Volltext-Suche in Anhängen
- [ ] Automatische Backup-Funktionen
- [ ] Advanced PDF-Layouts
- [ ] Bulk-Operations für Einträge
- [ ] Dark Mode
- [ ] PWA-Funktionalität
- [ ] API für Drittanbieter-Integrationen

---

**CommuniTrack** - Ihre rechtssichere Kommunikationsdokumentation 📝