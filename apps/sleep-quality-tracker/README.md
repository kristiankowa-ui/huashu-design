# Schlaf & Routine Tracker

Eine kleine, lokal laufende Web-App zum Erfassen deiner Schlafqualität (importiert
aus Google Fit), Tagesnotizen und deiner täglichen Routine (z.B. Morgenroutine,
Mobility Workout) — inklusive frei konfigurierbarer Trainingstage.

## Funktionen

- **Tabellenansicht** pro Tag: Schlafdauer, Tiefschlaf-, REM- und Leichtschlafanteil,
  ein geschätzter Qualitätswert, Checkboxen je Routine und ein Notizfeld.
- **Google Fit Import**: liest Schlafsitzungen (und, sofern verfügbar, Schlafphasen)
  direkt aus deinem Google-Konto über die Fitness REST API.
- **Frei konfigurierbare Routinen**: Name und Wochentage je Routine (z.B.
  "Morgenroutine" täglich, "Mobility Workout" nur Mo/Mi/Fr) lassen sich jederzeit
  anpassen; neue Routinen lassen sich hinzufügen.
- Alle Notizen, Routinen und importierten Schlafdaten werden ausschließlich lokal
  im Browser (`localStorage`) gespeichert — es gibt kein Backend.

## Google Fit Zugriff einrichten

1. Ein Projekt in der [Google Cloud Console](https://console.cloud.google.com/) anlegen
   (oder ein bestehendes verwenden).
2. Die [Fitness API](https://console.cloud.google.com/apis/library/fitness.googleapis.com)
   für das Projekt aktivieren.
3. Unter **APIs & Services → Anmeldedaten** einen **OAuth-Client-ID** vom Typ
   *Webanwendung* erstellen.
4. Bei **Autorisierte JavaScript-Ursprünge** die URL eintragen, unter der die App
   läuft (z.B. `http://localhost:5173` für die lokale Entwicklung).
5. Die erzeugte Client-ID entweder in `.env` als `VITE_GOOGLE_CLIENT_ID` eintragen
   (siehe `.env.example`) oder direkt im Verbindungs-Feld der App einfügen.

Die App fordert nur den Lesezugriff auf Schlafdaten an
(`https://www.googleapis.com/auth/fitness.sleep.read`).

> Hinweis: Google Fit selbst liefert keinen offiziellen "Schlafqualitäts-Score".
> Der in der Tabelle angezeigte Wert ist eine lokale Schätzung aus Schlafdauer
> sowie Tiefschlaf-/REM-Anteil.

## Entwicklung

```bash
npm install
npm run dev
```

## Produktions-Build

```bash
npm run build
npm run preview
```
