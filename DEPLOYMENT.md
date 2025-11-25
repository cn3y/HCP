# Deployment Guide

Detaillierte Anleitung für das Deployment der Golf Handicap Tracker Anwendung in verschiedenen Umgebungen.

## Inhaltsverzeichnis

- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD mit GitHub Actions](#cicd-mit-github-actions)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Docker Deployment

### Lokales Testen

```bash
# Image bauen
make build

# Oder manuell:
docker build -t golf-handicap-tracker:latest .

# Lokal testen
docker run -p 8080:80 golf-handicap-tracker:latest

# Öffnen Sie http://localhost:8080
```

### Mit Docker Compose (optional)

Erstellen Sie eine `docker-compose.yml`:

```yaml
version: '3.8'
services:
  golf-tracker:
    image: your-registry/golf-handicap-tracker:latest
    ports:
      - "8080:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

## Kubernetes Deployment

### Schritt-für-Schritt Anleitung

#### 1. Vorbereitung

```bash
# Verbindung zum Cluster prüfen
kubectl cluster-info
kubectl get nodes

# Namespace erstellen (optional)
kubectl create namespace golf-tracker
```

#### 2. Container Registry Setup

**Für Docker Hub:**
```bash
# Login
docker login

# Image bauen und taggen
docker build -t username/golf-handicap-tracker:v1.0.0 .
docker push username/golf-handicap-tracker:v1.0.0
```

**Für GitHub Container Registry:**
```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Image bauen und pushen
docker build -t ghcr.io/username/golf-handicap-tracker:v1.0.0 .
docker push ghcr.io/username/golf-handicap-tracker:v1.0.0
```

#### 3. Manifeste anpassen

Aktualisieren Sie `k8s/deployment.yaml`:

```yaml
spec:
  template:
    spec:
      containers:
      - name: golf-handicap-tracker
        image: your-registry/golf-handicap-tracker:v1.0.0  # Ihre Image-URL
```

Aktualisieren Sie `k8s/ingress.yaml`:

```yaml
spec:
  rules:
  - host: golf-handicap.ihre-domain.de  # Ihre Domain
```

#### 4. Deployment durchführen

```bash
# Mit Makefile (empfohlen)
make deploy NAMESPACE=golf-tracker

# Oder manuell
kubectl apply -f k8s/ -n golf-tracker

# Mit Kustomize
kubectl apply -k k8s/ -n golf-tracker
```

#### 5. Deployment verifizieren

```bash
# Status prüfen
make status NAMESPACE=golf-tracker

# Logs ansehen
make logs NAMESPACE=golf-tracker

# Port-Forward für Test
make port-forward NAMESPACE=golf-tracker
# Öffnen Sie http://localhost:8080
```

### TLS/HTTPS konfigurieren

#### Mit cert-manager und Let's Encrypt

1. cert-manager installieren:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. ClusterIssuer erstellen (`k8s/cluster-issuer.yaml`):
```yaml
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
          class: nginx
```

3. Ingress für TLS aktualisieren:
```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - golf-handicap.ihre-domain.de
    secretName: golf-handicap-tracker-tls
```

### Horizontal Pod Autoscaling

```bash
# HPA erstellen
kubectl autoscale deployment golf-handicap-tracker \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n golf-tracker

# HPA Status
kubectl get hpa -n golf-tracker
```

Oder als Manifest (`k8s/hpa.yaml`):

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: golf-handicap-tracker
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: golf-handicap-tracker
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## CI/CD mit GitHub Actions

### Setup

1. **GitHub Container Registry aktivieren:**
   - Gehen Sie zu Settings → Packages
   - Aktivieren Sie Package-Unterstützung

2. **Secrets konfigurieren** (für automatisches K8s Deployment):
   - `KUBE_CONFIG`: Base64-codierte kubeconfig
   ```bash
   cat ~/.kube/config | base64 -w 0
   ```

3. **Workflow aktivieren:**
   - Der Workflow in `.github/workflows/build-and-deploy.yaml` läuft automatisch
   - Bei Push auf main/master: Build + Push
   - Bei Tags (`v*`): Versioniertes Image

### Versionierung

```bash
# Tag erstellen
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions baut automatisch:
# - ghcr.io/username/golf-handicap-tracker:v1.0.0
# - ghcr.io/username/golf-handicap-tracker:1.0
# - ghcr.io/username/golf-handicap-tracker:latest
```

## Best Practices

### Security

1. **Image-Scanning:**
```bash
# Mit Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image golf-handicap-tracker:latest
```

2. **Least Privilege:**
   - Container läuft als non-root User (UID 101)
   - Read-only root filesystem wo möglich
   - Capabilities gedroppt

3. **Network Policies** (optional):
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: golf-handicap-tracker
spec:
  podSelector:
    matchLabels:
      app: golf-handicap-tracker
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
```

### Monitoring

1. **Prometheus Metrics** (optional):
   - Nginx Prometheus Exporter hinzufügen
   - ServiceMonitor für Prometheus Operator

2. **Logs aggregieren:**
```bash
# Mit kubectl stern
stern golf-handicap-tracker -n golf-tracker

# Oder direkt
kubectl logs -l app=golf-handicap-tracker -n golf-tracker --tail=100 -f
```

### Backup

Da die Anwendung stateless ist (Daten im Browser LocalStorage), ist kein Backend-Backup erforderlich.

## Troubleshooting

### Pod startet nicht

```bash
# Pod-Status und Events anzeigen
kubectl describe pod -l app=golf-handicap-tracker -n golf-tracker

# Logs anzeigen (auch bei crashed pods)
kubectl logs -l app=golf-handicap-tracker -n golf-tracker --previous
```

### Image Pull Fehler

```bash
# Image Pull Secret erstellen
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=TOKEN \
  -n golf-tracker

# In deployment.yaml referenzieren:
spec:
  template:
    spec:
      imagePullSecrets:
      - name: regcred
```

### Ingress funktioniert nicht

```bash
# Ingress Controller prüfen
kubectl get pods -n ingress-nginx

# Ingress Details
kubectl describe ingress golf-handicap-tracker -n golf-tracker

# Ingress Controller Logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### Performance Issues

```bash
# Ressourcen-Nutzung prüfen
kubectl top pods -n golf-tracker

# Mehr Replicas
make scale REPLICAS=5 NAMESPACE=golf-tracker

# Oder HPA aktivieren
kubectl autoscale deployment golf-handicap-tracker \
  --cpu-percent=70 --min=3 --max=10 -n golf-tracker
```

### Health Check Failures

```bash
# Health Endpoint manuell testen
kubectl exec -it deployment/golf-handicap-tracker -n golf-tracker -- wget -O- http://localhost/health

# Logs für Details
kubectl logs -l app=golf-handicap-tracker -n golf-tracker
```

## Rollback

```bash
# Rollout-Historie anzeigen
kubectl rollout history deployment/golf-handicap-tracker -n golf-tracker

# Zu vorheriger Version zurückkehren
kubectl rollout undo deployment/golf-handicap-tracker -n golf-tracker

# Zu spezifischer Revision
kubectl rollout undo deployment/golf-handicap-tracker --to-revision=2 -n golf-tracker
```

## Cleanup

```bash
# Mit Makefile
make delete NAMESPACE=golf-tracker

# Oder manuell
kubectl delete -f k8s/ -n golf-tracker

# Namespace löschen
kubectl delete namespace golf-tracker
```
