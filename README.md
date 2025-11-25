# Golf Handicap Tracker

Eine moderne Web-Anwendung zum Tracking Ihres Golf-Handicaps. Verfolgen Sie Ihre Entwicklung im Golfspiel mit ansprechenden Visualisierungen und detaillierten Statistiken.

## Features

- 📊 **Handicap-Berechnung** nach World Handicap System (WHS)
- 📈 **Visuelle Darstellung** Ihrer Handicap-Entwicklung
- 💾 **Serverseitige SQLite-Datenbank** für sichere Datenspeicherung
- 🎯 **Offizielle & Trainingsrunden** - Unterscheiden Sie zwischen offiziellen Runden und "Was-wäre-wenn" Szenarien
- 🧮 **Was-wäre-wenn Modus** - Sehen Sie, wie Trainingsrunden Ihr Handicap beeinflussen würden
- 📱 **Responsive Design** für Desktop, Tablet und Mobile
- 🎯 **Detaillierte Rundenübersicht** mit Score Differentials
- 📝 **Notizen zu Runden** - Halten Sie Wetterbedingungen und Besonderheiten fest
- ✨ **Modernes UI** mit TailwindCSS

## Technologie-Stack

### Frontend
- **React 18** - Modern UI-Framework
- **TypeScript** - Type-sichere Entwicklung
- **Vite** - Schneller Build-Prozess
- **TailwindCSS** - Utility-First CSS Framework
- **Recharts** - Datenvisualisierung
- **Lucide React** - Moderne Icons

### Backend
- **Node.js + Express** - RESTful API Server
- **SQLite (better-sqlite3)** - Leichtgewichtige, serverlose Datenbank
- **Helmet** - Security Middleware
- **CORS** - Cross-Origin Resource Sharing

## Installation

### Schnellstart mit Docker Compose (empfohlen)

```bash
# Starte Frontend + Backend mit einem Befehl
docker-compose up

# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

### Manuelle Installation

#### Backend

```bash
cd server
npm install

# Erstelle .env Datei
cp .env.example .env

# Starte Backend-Server
npm start
```

#### Frontend

```bash
npm install

# Erstelle .env Datei
cp .env.example .env

# Starte Entwicklungsserver
npm run dev

# Production Build erstellen
npm run build
```

## Verwendung

1. **Runde hinzufügen**: Klicken Sie auf "Neue Runde hinzufügen" und geben Sie die Details Ihrer Golfrunde ein:
   - Datum der Runde
   - Platzname
   - Course Rating
   - Slope Rating
   - Ihr Score
   - Par des Platzes
   - **Rundentyp**: Wählen Sie zwischen:
     - **Offizielle Runde**: Zählt für Ihr offizielles Handicap
     - **Trainingsrunde**: "Was-wäre-wenn" Szenario, zählt nicht für Handicap
   - Optionale Notizen (z.B. Wetterbedingungen)

2. **Handicap verfolgen**: Ihr aktuelles Handicap wird automatisch berechnet und auf der Hauptkarte angezeigt.

3. **"Was-wäre-wenn" Szenarien**:
   - Trainingsrunden werden separat erfasst
   - Sehen Sie in der blauen Karte, wie Ihr Handicap aussehen würde, wenn Trainingsrunden zählen würden
   - Perfekt zum Testen von Verbesserungen!

4. **Entwicklung analysieren**: Das Diagramm zeigt Ihre Handicap-Entwicklung über alle offiziellen Runden.

5. **Runden verwalten**: In der Rundenliste sehen Sie alle Runden mit Badges (Offiziell/Training). Runden können jederzeit gelöscht werden.

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

Alle Daten werden serverseitig in einer SQLite-Datenbank gespeichert:
- **Persistent**: Daten bleiben auch nach Browser-Neuladen erhalten
- **Sicher**: SQLite ist eine bewährte, robuste Datenbank
- **Portabel**: Die Datenbankdatei kann einfach gesichert werden
- **Lokal**: Bei lokaler Installation bleiben Ihre Daten auf Ihrem Server

### API Endpoints

Die Anwendung nutzt folgende REST-API Endpoints:

- `GET /api/rounds` - Alle Runden abrufen (mit optionalem Type-Filter)
- `GET /api/rounds/:id` - Einzelne Runde abrufen
- `POST /api/rounds` - Neue Runde erstellen
- `PUT /api/rounds/:id` - Runde aktualisieren
- `DELETE /api/rounds/:id` - Runde löschen
- `GET /api/statistics` - Statistiken abrufen
- `GET /health` - Health Check

## Browser-Kompatibilität

Die Anwendung funktioniert in allen modernen Browsern:
- Chrome/Edge (neueste 2 Versionen)
- Firefox (neueste 2 Versionen)
- Safari (neueste 2 Versionen)

## Kubernetes Deployment

Die Anwendung kann in einer Kubernetes-Umgebung deployed werden.

### Voraussetzungen

- Docker installiert und konfiguriert
- Zugriff auf eine Container Registry (Docker Hub, GHCR, etc.)
- kubectl installiert und mit dem Cluster verbunden
- Nginx Ingress Controller im Cluster (optional, für Ingress)

### 1. Docker Image bauen und pushen

```bash
# Image bauen
docker build -t your-registry/golf-handicap-tracker:latest .

# Image testen (optional)
docker run -p 8080:80 your-registry/golf-handicap-tracker:latest

# Image pushen
docker push your-registry/golf-handicap-tracker:latest
```

### 2. Kubernetes Manifeste anpassen

Passen Sie die Werte in `k8s/deployment.yaml` an:
- Ersetzen Sie `your-registry/golf-handicap-tracker:latest` mit Ihrer Image-URL

Passen Sie `k8s/ingress.yaml` an:
- Ändern Sie `golf-handicap.example.com` zu Ihrer Domain
- Kommentieren Sie TLS-Konfiguration ein, falls gewünscht

### 3. Deployment mit kubectl

```bash
# Alle Ressourcen deployen
kubectl apply -f k8s/

# Oder mit Kustomize
kubectl apply -k k8s/

# Status überprüfen
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
```

### 4. Deployment verifizieren

```bash
# Logs anzeigen
kubectl logs -l app=golf-handicap-tracker

# Pod-Details anzeigen
kubectl describe pod -l app=golf-handicap-tracker

# Port-Forward für lokalen Test (ohne Ingress)
kubectl port-forward svc/golf-handicap-tracker 8080:80
# Öffnen Sie http://localhost:8080
```

### 5. Update deployen

```bash
# Neues Image bauen und pushen
docker build -t your-registry/golf-handicap-tracker:v1.1.0 .
docker push your-registry/golf-handicap-tracker:v1.1.0

# Deployment aktualisieren
kubectl set image deployment/golf-handicap-tracker \
  golf-handicap-tracker=your-registry/golf-handicap-tracker:v1.1.0

# Rollout-Status überwachen
kubectl rollout status deployment/golf-handicap-tracker
```

### 6. Skalierung

```bash
# Anzahl der Replicas ändern
kubectl scale deployment/golf-handicap-tracker --replicas=5

# Horizontal Pod Autoscaler (optional)
kubectl autoscale deployment golf-handicap-tracker \
  --cpu-percent=70 --min=3 --max=10
```

### Kubernetes-Ressourcen

Die folgenden Kubernetes-Ressourcen werden deployed:

- **Deployment**: 3 Replicas mit Rolling Update-Strategie
- **Service**: ClusterIP Service auf Port 80
- **Ingress**: Nginx Ingress für externen Zugriff (optional)

### Health Checks

Die Anwendung bietet einen Health-Check-Endpoint:
- **URL**: `/health`
- **Liveness Probe**: Prüft alle 30 Sekunden
- **Readiness Probe**: Prüft alle 10 Sekunden

### Ressourcen-Anforderungen

- **Requests**: 64Mi RAM, 100m CPU
- **Limits**: 128Mi RAM, 200m CPU

Diese Werte können in `k8s/deployment.yaml` angepasst werden.

## Lizenz

MIT
