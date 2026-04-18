# Rezeptbuch

Web-App zum **Sammeln, Bearbeiten und Planen** eigener Rezepte: Import von Webseiten, Portionierung, Wochenplan, Einkaufsliste (inkl. Druckansicht), Favoriten, Reaktionen (Like/Dislike), Koch-Historie und ein geschützter **Admin-Bereich** für PIN und Erscheinungsbild.

Die Oberfläche ist auf **Deutsch** ausgerichtet (`lang="de"`).

![alt text](https://github.com/dandulox/rezepte/blob/main/startseite.png "Logo")

## Funktionen

- **Rezepte**: Anlegen, bearbeiten, Kategorien und Ernährungsart (z. B. vegan/vegetarisch), Zeiten, Zutaten mit Mengen, Zubereitungsschritte, optionale Bild- und Quell-URL.
- **Import**: Rezepte von URLs vorbefüllen (über `/import`, leitet nach `/recipes/new?mode=import` weiter).
- **Startseite**: Übersicht mit Sortierung nach Aktivität, Stimmen und Koch-Statistiken.
- **Favoriten**: Im **Browser** gespeichert (`localStorage`), nicht serverseitig.
- **Wochenplan** (`/plan`): Mahlzeiten auf Tage legen.
- **Einkauf** (`/plan/einkauf`): Aggregierte Liste zur Woche; **Druckansicht** unter `/plan/einkauf/druck`.
- **Statistik** (`/statistik`): Auswertung der Koch-Historie.
- **Reaktionen**: Like/Dislike pro Rezept (Cookie-basierte Besucherzuordnung möglich).
- **Übersetzungen**: Auf der Rezeptdetailseite können gespeicherte Übersetzungen (z. B. Englisch, Französisch) angezeigt werden; fehlende Texte lassen sich per Button erzeugen und in der Datenbank ablegen. Ohne **LibreTranslate** wird ein öffentlicher Fallback (MyMemory) genutzt — für häufige Nutzung besser `LIBRETRANSLATE_URL` setzen (siehe Umgebungsvariablen).
- **Admin** (`/admin`): Nach PIN-Login Theme-Farben, **Standard-Anzeigesprache** für Rezeptseiten (Original Deutsch vs. vorhandene Übersetzung) und weitere Einstellungen. PIN wird gehasht gespeichert. **Standard-PIN bei neuer/leerer Datenbank: `0000`** — in Produktion sofort ändern (`DEFAULT_ADMIN_PIN` in `src/lib/admin-constants.ts`).

## Technologie-Stack

| Bereich        | Technologie                                      |
|----------------|--------------------------------------------------|
| Framework      | [Next.js](https://nextjs.org/) 16 (App Router)   |
| UI             | React 19, Tailwind CSS 4                         |
| Datenbank      | SQLite über [Prisma](https://www.prisma.io/) 7 + [@libsql/client](https://github.com/tursodatabase/libsql-client-ts) |
| Tests          | [Vitest](https://vitest.dev/)                    |
| Import-Parsing | [cheerio](https://cheerio.js.org/)               |

> Hinweis: Dieses Projekt nutzt eine **neuere Next.js-Version** mit möglichen Abweichungen zur älteren Dokumentation. Bei Unsicherheiten die mitgelieferten Docs unter `node_modules/next/dist/docs/` beachten.

## Voraussetzungen

- **Node.js** (empfohlen: aktuelle LTS-Version, z. B. 20 oder 22)
- **npm** (oder kompatibler Paketmanager)

## Installation

```bash
git clone <repository-url> rezepte
cd rezepte
npm install
```

`postinstall` führt automatisch **`prisma generate`** aus (Client nach `src/generated/prisma`).

## Umgebungsvariablen

Lege im Projektroot eine Datei **`.env`** an (nicht committen, wenn sie Geheimnisse enthält).

| Variable | Pflicht | Beschreibung |
|----------|---------|--------------|
| `DATABASE_URL` | ja | LibSQL-/SQLite-URL, z. B. lokale Datei: `file:./dev.db` (relativ zum Arbeitsverzeichnis beim Start) |
| `ADMIN_SESSION_SECRET` | in **Produktion** ja | Mindestens **16 Zeichen**; signiert das Admin-Session-Cookie. In Development wird ein fester Fallback verwendet, wenn die Variable fehlt. |
| `NEXT_ALLOWED_DEV_ORIGINS` | nein | Im Dev-Modus zusätzliche erlaubte Origins (komma- oder leerzeichengetrennt), z. B. wenn du über LAN-IP oder einen anderen Hostnamen erreichst. Ergänzt die in `next.config.ts` eingetragenen Standard-Origins. |
| `LIBRETRANSLATE_URL` | nein | Basis-URL einer [LibreTranslate](https://libretranslate.com/)-Instanz (ohne abschließenden Slash). Wenn gesetzt, wird sie für Rezept-Übersetzungen bevorzugt; sonst MyMemory (Längen-/Tageslimits möglich). |
| `LIBRETRANSLATE_API_KEY` | nein | API-Key, falls die LibreTranslate-Instanz einen verlangt. |
| `RECIPE_TRANSLATE_SOURCE` | nein | ISO-Code der **Ausgangssprache** gespeicherter Rezepte für Übersetzungen (Standard: `de`). |

Beispiel **`.env`** (nur Struktur, Werte anpassen):

```env
DATABASE_URL="file:./dev.db"
ADMIN_SESSION_SECRET="mindestens-16-zeichen-lang"
# NEXT_ALLOWED_DEV_ORIGINS="192.168.1.10 mein-pc.local"
# LIBRETRANSLATE_URL="https://libretranslate.example.com"
# LIBRETRANSLATE_API_KEY=""
# RECIPE_TRANSLATE_SOURCE="de"
```

## Datenbank und Migrationen

Schema und Migrationen liegen unter `prisma/`.

**Erstmaliges Anlegen / Aktualisieren der Tabellen** (nach Klonen oder Schema-Änderung):

```bash
npx prisma migrate deploy
```

Für lokale Entwicklung mit neuen Migrationen (interaktiv):

```bash
npx prisma migrate dev
```

Die SQLite-Datei entsteht am Ort, den `DATABASE_URL` vorgibt (z. B. `./dev.db` im Projektroot bei `file:./dev.db`).

## Entwicklung

```bash
npm run dev
```

Die App läuft standardmäßig unter [http://localhost:3000](http://localhost:3000).

**Admin-Zugang**: Unter `/admin/login` anmelden. Beim **ersten** Anlegen der Admin-Zeile in der Datenbank ist die Standard-PIN **`0000`** (siehe `DEFAULT_ADMIN_PIN` in `src/lib/admin-constants.ts`); sie sollte in Produktion umgehend geändert werden.

## Produktion

```bash
npm run build
npm start
```

`build` führt `prisma generate` und `next build` aus. Vor dem ersten Start in Produktion Migrationen ausführen (`migrate deploy`) und alle erforderlichen Umgebungsvariablen setzen.

## Qualitätssicherung

```bash
npm run lint
npm test
```

Tests liegen u. a. unter `src/lib/*.test.ts`; Konfiguration: `vitest.config.ts`.

## Wichtige Routen

| Pfad | Inhalt |
|------|--------|
| `/` | Startseite (Rezeptübersicht) |
| `/import` | Weiterleitung nach `/recipes/new?mode=import` |
| `/recipes/new` | Neues Rezept; `?mode=import` für Import |
| `/recipes/[id]` | Rezeptdetail |
| `/recipes/[id]/edit` | Bearbeiten |
| `/recipes/kategorien` | Kategorien |
| `/favoriten` | Favoriten (lokal) |
| `/plan`, `/plan/einkauf`, `/plan/einkauf/druck` | Planung & Einkauf |
| `/statistik` | Koch-Statistik |
| `/admin`, `/admin/login` | Administration (Login mit PIN; Standard bei frischer DB: **`0000`**) |

## Projektstruktur (Auszug)

```
src/
  app/           # Next.js App Router: Seiten, Layout, API-Routen
  components/    # React-Komponenten
  lib/           # Hilfsfunktionen, Prisma-Zugriff, Domain-Logik
  generated/     # Prisma Client (nach generate)
prisma/
  schema.prisma
  migrations/
```

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE) (Open Source). Kurzfassung: Nutzung, Änderung und Weitergabe sind erlaubt; der Urheberrechtshinweis muss erhalten bleiben; es gibt keine Gewährleistung.
