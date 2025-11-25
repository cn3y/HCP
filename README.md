# Golf Handicap Tracker

Eine moderne Web-Anwendung zum Tracking Ihres Golf-Handicaps. Verfolgen Sie Ihre Entwicklung im Golfspiel mit ansprechenden Visualisierungen und detaillierten Statistiken.

## Features

- 📊 **Handicap-Berechnung** nach World Handicap System (WHS)
- 📈 **Visuelle Darstellung** Ihrer Handicap-Entwicklung
- 💾 **Automatische Speicherung** im Browser (LocalStorage)
- 📱 **Responsive Design** für Desktop, Tablet und Mobile
- 🎯 **Detaillierte Rundenübersicht** mit Score Differentials
- ✨ **Modernes UI** mit TailwindCSS

## Technologie-Stack

- **React 18** - Modern UI-Framework
- **TypeScript** - Type-sichere Entwicklung
- **Vite** - Schneller Build-Prozess
- **TailwindCSS** - Utility-First CSS Framework
- **Recharts** - Datenvisualisierung
- **Lucide React** - Moderne Icons

## Installation

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Production Build erstellen
npm run build

# Preview des Production Builds
npm run preview
```

## Verwendung

1. **Runde hinzufügen**: Klicken Sie auf "Neue Runde hinzufügen" und geben Sie die Details Ihrer Golfrunde ein:
   - Datum der Runde
   - Platzname
   - Course Rating
   - Slope Rating
   - Ihr Score
   - Par des Platzes

2. **Handicap verfolgen**: Ihr aktuelles Handicap wird automatisch berechnet und auf der Hauptkarte angezeigt.

3. **Entwicklung analysieren**: Das Diagramm zeigt Ihre Handicap-Entwicklung über alle gespielten Runden.

4. **Runden verwalten**: In der Rundenliste sehen Sie alle Ihre Runden mit detaillierten Informationen. Runden können jederzeit gelöscht werden.

## Handicap-Berechnung

Die Anwendung verwendet eine vereinfachte Version des World Handicap System (WHS):

1. **Score Differential**: `(113 / Slope Rating) × (Score - Course Rating)`
2. **Handicap Index**: Durchschnitt der besten Score Differentials × 0.96

Die Anzahl der verwendeten Runden variiert je nach Anzahl der gespielten Runden:
- 1-5 Runden: beste 1
- 6-8 Runden: beste 2
- 9-11 Runden: beste 3
- 12-14 Runden: beste 4
- 15-16 Runden: beste 5
- 17-18 Runden: beste 6
- 19 Runden: beste 7
- 20+ Runden: beste 8

## Datenspeicherung

Alle Daten werden lokal im Browser gespeichert (LocalStorage). Es werden keine Daten an externe Server gesendet. Ihre Daten bleiben vollständig privat auf Ihrem Gerät.

## Browser-Kompatibilität

Die Anwendung funktioniert in allen modernen Browsern:
- Chrome/Edge (neueste 2 Versionen)
- Firefox (neueste 2 Versionen)
- Safari (neueste 2 Versionen)

## Lizenz

MIT
