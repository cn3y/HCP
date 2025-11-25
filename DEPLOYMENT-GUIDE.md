# Deployment Guide für Golf Handicap Tracker

Umfassende Anleitung für das Deployment der Anwendung mit Docker Compose oder Kubernetes (Longhorn + Traefik).

## Inhaltsverzeichnis

- [Docker Compose Deployment](#docker-compose-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Longhorn Storage](#longhorn-storage)
- [Traefik vs Nginx Ingress](#traefik-vs-nginx-ingress)
- [Makefile-Befehle](#makefile-befehle)

## Docker Compose Deployment

### Voraussetzungen

- Docker und Docker Compose installiert
- Ports 5173 (Frontend) und 3001 (Backend) verfügbar

### Starten

```bash
# Schnellstart
make compose-up

# Oder direkt mit Docker Compose
docker-compose up -d

# Logs anzeigen
make compose-logs

# Stoppen
make compose-down
```

### Zugriff

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Daten-Persistenz

Die SQLite-Datenbank wird in einem Docker Volume gespeichert:
```bash
# Volume anzeigen
docker volume ls | grep golf-data

# Daten sichern
docker run --rm -v golf-data:/data -v $(pwd):/backup alpine tar czf /backup/golf-data-backup.tar.gz /data
```

## Kubernetes Deployment

### Architektur

Die Anwendung besteht aus:
- **Frontend**: Nginx mit React Build (3 Replicas)
- **Backend**: Node.js Express API (2 Replicas)
- **Datenbank**: SQLite auf Longhorn PVC (1Gi)
- **Ingress**: Traefik oder Nginx für externen Zugriff

### Voraussetzungen

1. **Kubernetes Cluster** mit kubectl Zugriff
2. **Longhorn** Storage Class installiert
3. **Traefik** oder **Nginx** Ingress Controller

#### Longhorn prüfen

```bash
# Status prüfen
kubectl get pods -n longhorn-system
kubectl get storageclass longhorn

# Als Default setzen (optional)
kubectl patch storageclass longhorn \
  -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

#### Traefik prüfen

```bash
# Status prüfen
kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik

# Traefik Dashboard (falls aktiviert)
kubectl port-forward -n kube-system $(kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik -o name | head -1) 9000:9000
```

### Deployment-Optionen

#### Option 1: Mit Traefik (empfohlen)

```bash
# 1. Images bauen und pushen
make build REGISTRY=your-registry VERSION=v1.0.0
make push

# 2. Manifeste anpassen (siehe unten)

# 3. Deployen
make deploy-traefik

# Oder mit kubectl
kubectl apply -k k8s/overlays/traefik/
```

#### Option 2: Mit Nginx

```bash
make deploy-nginx

# Oder mit kubectl
kubectl apply -k k8s/overlays/nginx/
```

### Konfiguration anpassen

#### 1. Container Registry

Ändern Sie in `k8s/deployment.yaml`:
```yaml
spec:
  template:
    spec:
      containers:
      - name: golf-handicap-tracker
        image: your-registry/golf-handicap-tracker:v1.0.0  # <- Ihre Registry
```

Und in `k8s/backend-deployment.yaml`:
```yaml
image: your-registry/golf-handicap-backend:v1.0.0  # <- Ihre Registry
```

#### 2. Domain konfigurieren

In `k8s/ingress-traefik.yaml`:
```yaml
spec:
  rules:
  - host: golf.ihre-domain.de  # <- Ihre Domain
```

#### 3. Storage anpassen (optional)

In `k8s/pvc.yaml`:
```yaml
spec:
  storageClassName: longhorn  # Default
  resources:
    requests:
      storage: 5Gi  # Default: 1Gi
```

### Deployment durchführen

```bash
# Status vor Deployment prüfen
kubectl get nodes
kubectl get storageclass
kubectl get pods -n longhorn-system

# Deployen
make deploy-traefik NAMESPACE=default

# Status überprüfen
make status
kubectl get pvc  # Longhorn Volume prüfen
kubectl get ingress

# Logs anzeigen
make logs              # Frontend
make backend-logs      # Backend
```

## Longhorn Storage

### Features

- Distributed Block Storage für Kubernetes
- Automatische Replikation (Default: 3 Kopien)
- Snapshots und Backups
- Web-UI für Management

### PVC Status prüfen

```bash
# PVC Status
make pvc-status

# Longhorn UI öffnen (falls installiert)
kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80
# Öffnen Sie: http://localhost:8080
```

### Backup erstellen

```bash
# Über Makefile
make db-backup

# Manuell
POD=$(kubectl get pod -l app=golf-handicap-backend -o jsonpath='{.items[0].metadata.name}')
kubectl cp $POD:/app/data/golf-handicap.db ./backup.db
```

### Backup wiederherstellen

```bash
make db-restore FILE=backup.db
```

### Longhorn Snapshots (optional)

Erstellen Sie einen VolumeSnapshot für automatische Backups:

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: golf-handicap-snapshot
spec:
  volumeSnapshotClassName: longhorn
  source:
    persistentVolumeClaimName: golf-handicap-data
```

## Traefik vs Nginx Ingress

### Traefik Features

- **Automatisches TLS** mit Let's Encrypt
- **WebSocket Support** out-of-the-box
- **Middleware** für Security Headers, Rate Limiting, etc.
- **Dashboard** für Monitoring

**Traefik Annotations:**
```yaml
annotations:
  traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
  traefik.ingress.kubernetes.io/router.tls: "true"
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### Nginx Features

- **Bewährt** und stabil
- **Umfangreiche Konfiguration** möglich
- **Große Community**

**Nginx Annotations:**
```yaml
annotations:
  nginx.ingress.kubernetes.io/rewrite-target: /
  nginx.ingress.kubernetes.io/ssl-redirect: "true"
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### TLS/HTTPS mit cert-manager

Beide Ingress Controller funktionieren mit cert-manager:

```bash
# cert-manager installieren
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# ClusterIssuer erstellen
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ihre-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik  # oder nginx
EOF
```

## Makefile-Befehle

### Docker Compose

```bash
make compose-up          # Starten
make compose-down        # Stoppen
make compose-logs        # Logs anzeigen
make compose-restart     # Neustarten
make compose-build       # Images neu bauen
```

### Docker Images

```bash
make build              # Frontend + Backend bauen
make build-frontend     # Nur Frontend
make build-backend      # Nur Backend
make push               # Beide Images pushen
make build-push         # Bauen und pushen
```

### Kubernetes Deployment

```bash
make deploy-traefik     # Deploy mit Traefik
make deploy-nginx       # Deploy mit Nginx
make deploy INGRESS=traefik  # Mit Variable

make status             # Status aller Ressourcen
make logs               # Frontend Logs
make backend-logs       # Backend Logs
make rollout            # Rollout Status
```

### Skalierung

```bash
make scale REPLICAS=5   # Frontend skalieren
kubectl scale deployment/golf-handicap-backend --replicas=3  # Backend
```

### Datenbank

```bash
make db-backup          # Backup erstellen
make db-restore FILE=backup.db  # Wiederherstellen
make backend-shell      # Shell im Backend Pod
```

### Port-Forwarding

```bash
make port-forward       # Frontend (Port 8080)
make backend-port-forward  # Backend (Port 3001)
```

### Cleanup

```bash
make delete             # Alle Ressourcen löschen
make compose-down       # Docker Compose stoppen
```

## Monitoring & Troubleshooting

### Logs

```bash
# Frontend
kubectl logs -l app=golf-handicap-tracker --tail=100 -f

# Backend
kubectl logs -l app=golf-handicap-backend --tail=100 -f

# Alle zusammen
kubectl logs -l app=golf-handicap-tracker --all-containers=true -f
```

### Pod-Status

```bash
# Alle Pods
kubectl get pods -l app=golf-handicap-tracker

# Detaillierte Info
kubectl describe pod -l app=golf-handicap-backend

# Events anzeigen
kubectl get events --sort-by='.lastTimestamp'
```

### Ingress debuggen

**Traefik:**
```bash
# Traefik Logs
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik -f

# Routes anzeigen (im Dashboard oder via API)
kubectl port-forward -n kube-system svc/traefik 9000:9000
```

**Nginx:**
```bash
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -f
```

### PVC Probleme

```bash
# PVC Status
kubectl describe pvc golf-handicap-data

# Longhorn Volumes
kubectl get volumes -n longhorn-system

# Longhorn Events
kubectl get events -n longhorn-system --sort-by='.lastTimestamp'
```

## Best Practices

### 1. Resource Limits

Die Deployments haben bereits sinnvolle Limits:
- Frontend: 64Mi-128Mi RAM, 100m-200m CPU
- Backend: 128Mi-256Mi RAM, 100m-500m CPU

### 2. Health Checks

Beide Services haben Health Checks:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
```

### 3. Secrets

Für Production sollten Sie Secrets verwenden:
```bash
kubectl create secret generic golf-handicap-secrets \
  --from-literal=db-password=your-password
```

### 4. Backups

Automatisieren Sie Backups mit einem CronJob:
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: golf-handicap-backup
spec:
  schedule: "0 2 * * *"  # Täglich um 2 Uhr
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: alpine
            command: ["/bin/sh", "-c"]
            args:
            - cp /app/data/golf-handicap.db /backup/backup-$(date +%Y%m%d).db
            volumeMounts:
            - name: data
              mountPath: /app/data
            - name: backup
              mountPath: /backup
```

### 5. Monitoring

Integrieren Sie Prometheus für Monitoring:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: golf-handicap-backend
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3001"
    prometheus.io/path: "/metrics"
```

## Produktions-Checkliste

- [ ] Images in private Registry gepusht
- [ ] Domain konfiguriert und DNS eingerichtet
- [ ] TLS-Zertifikate mit cert-manager
- [ ] Resource Limits angepasst
- [ ] Backup-Strategie implementiert
- [ ] Monitoring aufgesetzt
- [ ] Logs aggregiert (z.B. mit Loki)
- [ ] Secrets statt Plain-Text
- [ ] Network Policies (optional)
- [ ] Pod Security Policies

## Support

Bei Problemen:
1. Prüfen Sie die Logs (`make logs` / `make backend-logs`)
2. Überprüfen Sie den PVC-Status (`make pvc-status`)
3. Prüfen Sie Ingress-Logs
4. Siehe `k8s/README.md` für detailliertes Troubleshooting
