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
