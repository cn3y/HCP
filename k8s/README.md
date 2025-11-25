# Kubernetes Deployment Guide

Dieses Verzeichnis enthält Kubernetes-Manifeste für das Deployment der Golf Handicap Tracker Anwendung.

## Übersicht

Die Anwendung besteht aus zwei Hauptkomponenten:
- **Frontend** (React + Nginx): Statische Web-Anwendung
- **Backend** (Node.js + Express): REST API mit SQLite-Datenbank

## Deployment-Optionen

### Option 1: Mit Traefik Ingress (Empfohlen für Longhorn)

Verwenden Sie diese Option, wenn Sie Traefik als Ingress Controller installiert haben:

```bash
# Mit Kustomize
kubectl apply -k overlays/traefik/

# Oder manuell
kubectl apply -f pvc.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress-traefik.yaml
```

### Option 2: Mit Nginx Ingress

Verwenden Sie diese Option, wenn Sie Nginx Ingress Controller haben:

```bash
# Mit Kustomize
kubectl apply -k overlays/nginx/

# Oder manuell
kubectl apply -f pvc.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## Voraussetzungen

### 1. Storage Class (Longhorn)

Die Anwendung verwendet standardmäßig Longhorn als Storage Class:

```bash
# Prüfen Sie, ob Longhorn verfügbar ist
kubectl get storageclass longhorn

# Optional: Als Default Storage Class setzen
kubectl patch storageclass longhorn -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

Falls Sie eine andere Storage Class verwenden möchten, ändern Sie `storageClassName` in `pvc.yaml`.

### 2. Ingress Controller

**Traefik (empfohlen):**
```bash
# Prüfen Sie, ob Traefik läuft
kubectl get pods -n kube-system | grep traefik
```

**Nginx:**
```bash
# Prüfen Sie, ob Nginx Ingress läuft
kubectl get pods -n ingress-nginx
```

## Konfiguration

### Anpassen der Manifeste

1. **Ingress Domain** in `ingress-traefik.yaml` oder `ingress.yaml`:
   ```yaml
   spec:
     rules:
     - host: golf-handicap.ihre-domain.de  # <- Ändern
   ```

2. **Container Images** in `deployment.yaml` und `backend-deployment.yaml`:
   ```yaml
   image: your-registry/golf-handicap-tracker:latest  # <- Ändern
   ```

3. **Namespace** (optional):
   ```bash
   # Namespace erstellen
   kubectl create namespace golf-tracker

   # In kustomization.yaml anpassen
   namespace: golf-tracker
   ```

4. **Storage Size** in `pvc.yaml`:
   ```yaml
   resources:
     requests:
       storage: 5Gi  # Default: 1Gi
   ```

## Ressourcen-Übersicht

### Frontend (deployment.yaml)
- **Replicas**: 3
- **Resources**: 64Mi-128Mi RAM, 100m-200m CPU
- **Port**: 80
- **Image**: Nginx mit React Build

### Backend (backend-deployment.yaml)
- **Replicas**: 2
- **Resources**: 128Mi-256Mi RAM, 100m-500m CPU
- **Port**: 3001
- **Image**: Node.js mit Express API
- **Volume**: SQLite-Datenbank auf Longhorn PVC

### Persistent Volume
- **Storage**: 1Gi (anpassbar)
- **Access Mode**: ReadWriteOnce
- **Storage Class**: longhorn

### Services
- **golf-handicap-tracker**: ClusterIP auf Port 80 (Frontend)
- **golf-handicap-backend**: ClusterIP auf Port 3001 (Backend)

### Ingress
- **Frontend**: `/` → Port 80
- **Backend API**: `/api` → Port 3001
- **TLS**: Unterstützt mit cert-manager

## TLS/HTTPS mit cert-manager

### cert-manager installieren (falls nicht vorhanden)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### ClusterIssuer erstellen

```bash
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

### Ingress für TLS aktivieren

Die TLS-Konfiguration ist bereits in den Ingress-Manifesten vorbereitet. Entfernen Sie einfach die Kommentare:

```yaml
# In ingress-traefik.yaml oder ingress.yaml
annotations:
  cert-manager.io/cluster-issuer: "letsencrypt-prod"  # <- Entkommentieren

tls:
  - hosts:
    - golf-handicap.example.com
    secretName: golf-handicap-tracker-tls  # <- Entkommentieren
```

## Monitoring & Debugging

### Status überprüfen

```bash
# Alle Ressourcen
kubectl get all -l app=golf-handicap-tracker

# PVC Status
kubectl get pvc golf-handicap-data
kubectl describe pvc golf-handicap-data

# Pods
kubectl get pods -l app=golf-handicap-tracker
kubectl get pods -l app=golf-handicap-backend

# Logs
kubectl logs -l app=golf-handicap-tracker --tail=100
kubectl logs -l app=golf-handicap-backend --tail=100

# Ingress
kubectl get ingress
kubectl describe ingress golf-handicap-tracker
```

### In Pod einsteigen

```bash
# Backend Pod
kubectl exec -it deployment/golf-handicap-backend -- sh

# Datenbank prüfen
ls -la /app/data/
```

### Port-Forward für lokalen Test

```bash
# Frontend
kubectl port-forward svc/golf-handicap-tracker 8080:80

# Backend
kubectl port-forward svc/golf-handicap-backend 3001:3001

# Dann öffnen: http://localhost:8080
```

## Skalierung

```bash
# Frontend skalieren
kubectl scale deployment/golf-handicap-tracker --replicas=5

# Backend skalieren
kubectl scale deployment/golf-handicap-backend --replicas=3

# HPA aktivieren
kubectl autoscale deployment/golf-handicap-tracker --cpu-percent=70 --min=3 --max=10
kubectl autoscale deployment/golf-handicap-backend --cpu-percent=70 --min=2 --max=5
```

## Backup & Restore

### Datenbank sichern

```bash
# Pod finden
POD=$(kubectl get pod -l app=golf-handicap-backend -o jsonpath='{.items[0].metadata.name}')

# Datenbank kopieren
kubectl cp $POD:/app/data/golf-handicap.db ./backup-$(date +%Y%m%d).db
```

### Datenbank wiederherstellen

```bash
# In Pod kopieren
kubectl cp ./backup.db $POD:/app/data/golf-handicap.db

# Pod neu starten
kubectl rollout restart deployment/golf-handicap-backend
```

## Cleanup

```bash
# Mit Kustomize
kubectl delete -k overlays/traefik/
# oder
kubectl delete -k overlays/nginx/

# Manuell
kubectl delete ingress golf-handicap-tracker
kubectl delete service golf-handicap-tracker golf-handicap-backend
kubectl delete deployment golf-handicap-tracker golf-handicap-backend
kubectl delete pvc golf-handicap-data
```

## Troubleshooting

### PVC bleibt im Pending-Status

```bash
# Prüfen Sie Longhorn
kubectl get pods -n longhorn-system

# Prüfen Sie Storage Classes
kubectl get storageclass
```

### Ingress funktioniert nicht

**Traefik:**
```bash
# Traefik Status
kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik

# Traefik Logs
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik
```

**Nginx:**
```bash
# Nginx Ingress Status
kubectl get pods -n ingress-nginx

# Nginx Logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### Backend kann nicht auf Datenbank zugreifen

```bash
# Volume Mount prüfen
kubectl describe pod -l app=golf-handicap-backend

# In Pod einsteigen und prüfen
kubectl exec -it deployment/golf-handicap-backend -- sh
ls -la /app/data/
touch /app/data/test.txt  # Schreibrechte testen
```

### Image Pull Error

```bash
# ImagePullSecret erstellen
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=TOKEN

# In Deployment referenzieren:
spec:
  template:
    spec:
      imagePullSecrets:
      - name: regcred
```
