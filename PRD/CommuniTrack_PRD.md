
# 📝 Product Requirements Document (PRD)

**Produktname:** CommuniTrack  
**Ziel:** Dokumentation, Organisation und Export von kommunikationsbezogenen Ereignissen mit einer Ex-Partnerin  
**Plattform:** Web-App (Next.js)  
**Zielgruppe:** Einzelpersonen mit Bedarf an rechtssicherer, strukturierter Dokumentation privater Kommunikation

---

## 1. Ziele & Nutzen
- **Zentrale Erfassung** von Kommunikationsverläufen, Ereignissen und Screenshots  
- **Einfaches Hinzufügen** von Bildern, Texten und Kontext (auch via Copy & Paste)  
- **Chronologische Historie** aller Einträge  
- **Exportfunktion** für rechtliche Zwecke (z. B. PDF für Gericht)  
- **Moderne, minimalistische UI** ohne Ablenkung  
- **100 % private Nutzung** (kein Teilen, kein Social Feature)

---

## 2. Funktionen

### 2.1. Eintragsverwaltung
- ✍️ Manuelle Erstellung von Einträgen mit:
  - Titel  
  - Datum und Uhrzeit (auch rückdatierbar)  
  - Beschreibung / Kontextfeld (Rich Text Editor optional)  
  - Kategorie (Dropdown, z. B. Konflikt, Gespräch, Verhalten, Beweis, Kindbetreuung etc.)  
  - Anhänge (Bilder, Screenshots etc.)
- 📋 Copy & Paste Unterstützung für:
  - Bilder (Clipboard-Upload)  
  - Textinhalte mit automatischer Umwandlung in formatierten Eintrag

### 2.2. Medienhandling
- 🖼️ Drag & Drop + Copy & Paste für Bilder  
- 🗂️ Jeder Datei kann ein Kontext zugewiesen werden  
- 📌 Möglichkeit zur Markierung von „wichtigen“ Dateien

### 2.3. Chronologie / Historie
- 📅 Zeitstrahl-Ansicht  
- 🔍 Filter & Suche (nach Zeitraum, Kategorie, Stichwort, Medien enthalten)  
- 🏷️ Tags zur weiteren Kategorisierung

### 2.4. Exportfunktion
- 📄 Export der Historie als:
  - PDF (mit Bildern, Zeitstempeln und Texten)  
  - JSON / CSV für Rohdaten  
- 🔐 Export mit optionalem Passwortschutz

### 2.5. Benutzer- & Datenschutz
- 🛡️ Lokale Speicherung (optional) oder verschlüsselte Cloud (z. B. Supabase oder Firebase)  
- 🔐 Login/Passwortschutz  
- 🔒 Ende-zu-Ende-Verschlüsselung (optional)

---

## 3. Technische Anforderungen

### 3.1. Frontend
- **Framework:** Next.js (React)  
- **UI:** Tailwind CSS (modern, lightweight)  
- **State Management:** Zustand oder Redux Toolkit  
- **Bildverarbeitung:** Kompression vor Upload, Preview-Rendering

### 3.2. Backend / Datenbank
- **Datenbank:** PostgreSQL (z. B. via Supabase)  
- **File Storage:** Supabase Storage oder Cloudinary  
- **APIs:** REST oder GraphQL  
- **Authentication:** Supabase Auth oder NextAuth

### 3.3. Export / Dokumentengenerierung
- PDF-Export mit `pdf-lib` oder `react-pdf`  
- JSON/CSV mit Standard Exporter Libs  
- Optional: automatisierte ZIP-Pakete mit Medien + JSON + PDF

---

## 4. Nicht-Funktionale Anforderungen
- ✅ Responsive Design (Mobile First)  
- ✅ Schnelle Ladezeiten  
- ✅ Minimale kognitive Belastung für den Nutzer  
- ✅ Datenschutzkonform (mindestens DSGVO-orientiert)

---

## 5. User Stories (Auswahl)

- **Als Nutzer** möchte ich Ereignisse dokumentieren, damit ich einen lückenlosen Verlauf habe.  
- **Als Nutzer** möchte ich Bilder per Copy & Paste einfügen, damit ich Chatverläufe oder Screenshots schnell hinzufügen kann.  
- **Als Nutzer** möchte ich alle Einträge chronologisch sehen, um Muster im Verhalten erkennen zu können.  
- **Als Nutzer** möchte ich alles exportieren können, um im Fall eines Rechtsstreits beweisfähig zu sein.

---

## 6. MVP-Umfang (Minimal Viable Product)
| Feature                         | Status |
|--------------------------------|--------|
| Manuelle Eintragsanlage        | ✅     |
| Upload & Copy-Paste von Bildern| ✅     |
| Chronologische Ansicht         | ✅     |
| PDF-Export                     | ✅     |
| Login / Authentifizierung      | ✅     |

---

## 7. Designprinzipien
- 📱 Mobile first  
- ✨ Zero clutter (nur das Wesentliche sichtbar)  
- ⚡ Sofortige Reaktion auf Nutzeraktionen (keine Ladezeiten, wo vermeidbar)  
- 💬 Klarer Sprachstil (keine juristische oder technische Sprache)
