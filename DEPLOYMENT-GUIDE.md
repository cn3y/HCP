# Deployment Guide for Golf Handicap Tracker

Comprehensive guide for deploying the application with Docker Compose or Kubernetes (Longhorn + Traefik).

## Table of Contents

- [Docker Compose Deployment](#docker-compose-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Longhorn Storage](#longhorn-storage)
- [Traefik vs Nginx Ingress](#traefik-vs-nginx-ingress)
- [Makefile Commands](#makefile-commands)

## Docker Compose Deployment

### Prerequisites

- Docker and Docker Compose installed
- Ports 5173 (Frontend) and 3001 (Backend) available

### Starting

```bash
# Quick start
make compose-up

# Or directly with Docker Compose
docker-compose up -d

# View logs
make compose-logs

# Stop
make compose-down
```

### Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Data Persistence

The SQLite database is stored in a Docker Volume:
```bash
# Show volume
docker volume ls | grep golf-data

# Backup data
docker run --rm -v golf-data:/data -v $(pwd):/backup alpine tar czf /backup/golf-data-backup.tar.gz /data
```

## Kubernetes Deployment

### Architecture

The application consists of:
- **Frontend**: Nginx with React build (3 Replicas)
- **Backend**: Node.js Express API (2 Replicas)
- **Database**: SQLite on Longhorn PVC (1Gi)
- **Ingress**: Traefik or Nginx for external access

### Prerequisites

1. **Kubernetes Cluster** with kubectl access
2. **Longhorn** Storage Class installed
3. **Traefik** or **Nginx** Ingress Controller

#### Check Longhorn

```bash
# Check status
kubectl get pods -n longhorn-system
kubectl get storageclass longhorn

# Set as default (optional)
kubectl patch storageclass longhorn \
  -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

#### Check Traefik

```bash
# Check status
kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik

# Traefik Dashboard (if enabled)
kubectl port-forward -n kube-system $(kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik -o name | head -1) 9000:9000
```

### Deployment Options

#### Option 1: With Traefik (Recommended)

```bash
# 1. Build and push images
make build REGISTRY=your-registry VERSION=v1.0.0
make push

# 2. Adjust manifests (see below)

# 3. Deploy
make deploy-traefik

# Or with kubectl
kubectl apply -k k8s/overlays/traefik/
```

#### Option 2: With Nginx

```bash
make deploy-nginx

# Or with kubectl
kubectl apply -k k8s/overlays/nginx/
```

### Customize Configuration

#### 1. Container Registry

Change in `k8s/deployment.yaml`:
```yaml
spec:
  template:
    spec:
      containers:
      - name: golf-handicap-tracker
        image: your-registry/golf-handicap-tracker:v1.0.0  # <- Your registry
```

And in `k8s/backend-deployment.yaml`:
```yaml
image: your-registry/golf-handicap-backend:v1.0.0  # <- Your registry
```

#### 2. Configure Domain

In `k8s/ingress-traefik.yaml`:
```yaml
spec:
  rules:
  - host: golf.your-domain.com  # <- Your domain
```

#### 3. Adjust Storage (optional)

In `k8s/pvc.yaml`:
```yaml
spec:
  storageClassName: longhorn  # Default
  resources:
    requests:
      storage: 5Gi  # Default: 1Gi
```

### Perform Deployment

```bash
# Check status before deployment
kubectl get nodes
kubectl get storageclass
kubectl get pods -n longhorn-system

# Deploy
make deploy-traefik NAMESPACE=default

# Check status
make status
kubectl get pvc  # Check Longhorn volume
kubectl get ingress

# View logs
make logs              # Frontend
make backend-logs      # Backend
```

## Longhorn Storage

### Features

- Distributed block storage for Kubernetes
- Automatic replication (default: 3 copies)
- Snapshots and backups
- Web UI for management

### Check PVC Status

```bash
# PVC status
make pvc-status

# Open Longhorn UI (if installed)
kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80
# Open: http://localhost:8080
```

### Create Backup

```bash
# Via Makefile
make db-backup

# Manually
POD=$(kubectl get pod -l app=golf-handicap-backend -o jsonpath='{.items[0].metadata.name}')
kubectl cp $POD:/app/data/golf-handicap.db ./backup.db
```

### Restore Backup

```bash
make db-restore FILE=backup.db
```

### Longhorn Snapshots (optional)

Create a VolumeSnapshot for automatic backups:

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

- **Automatic TLS** with Let's Encrypt
- **WebSocket Support** out-of-the-box
- **Middleware** for security headers, rate limiting, etc.
- **Dashboard** for monitoring

**Traefik Annotations:**
```yaml
annotations:
  traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
  traefik.ingress.kubernetes.io/router.tls: "true"
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### Nginx Features

- **Battle-tested** and stable
- **Extensive configuration** possible
- **Large community**

**Nginx Annotations:**
```yaml
annotations:
  nginx.ingress.kubernetes.io/rewrite-target: /
  nginx.ingress.kubernetes.io/ssl-redirect: "true"
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### TLS/HTTPS with cert-manager

Both ingress controllers work with cert-manager:

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik  # or nginx
EOF
```

## Makefile Commands

### Docker Compose

```bash
make compose-up          # Start
make compose-down        # Stop
make compose-logs        # View logs
make compose-restart     # Restart
make compose-build       # Rebuild images
```

### Docker Images

```bash
make build              # Build frontend + backend
make build-frontend     # Frontend only
make build-backend      # Backend only
make push               # Push both images
make build-push         # Build and push
```

### Kubernetes Deployment

```bash
make deploy-traefik     # Deploy with Traefik
make deploy-nginx       # Deploy with Nginx
make deploy INGRESS=traefik  # With variable

make status             # Status of all resources
make logs               # Frontend logs
make backend-logs       # Backend logs
make rollout            # Rollout status
```

### Scaling

```bash
make scale REPLICAS=5   # Scale frontend
kubectl scale deployment/golf-handicap-backend --replicas=3  # Backend
```

### Database

```bash
make db-backup          # Create backup
make db-restore FILE=backup.db  # Restore
make backend-shell      # Shell in backend pod
```

### Port Forwarding

```bash
make port-forward       # Frontend (port 8080)
make backend-port-forward  # Backend (port 3001)
```

### Cleanup

```bash
make delete             # Delete all resources
make compose-down       # Stop Docker Compose
```

## Monitoring & Troubleshooting

### Logs

```bash
# Frontend
kubectl logs -l app=golf-handicap-tracker --tail=100 -f

# Backend
kubectl logs -l app=golf-handicap-backend --tail=100 -f

# All together
kubectl logs -l app=golf-handicap-tracker --all-containers=true -f
```

### Pod Status

```bash
# All pods
kubectl get pods -l app=golf-handicap-tracker

# Detailed info
kubectl describe pod -l app=golf-handicap-backend

# Show events
kubectl get events --sort-by='.lastTimestamp'
```

### Debug Ingress

**Traefik:**
```bash
# Traefik logs
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik -f

# Show routes (in dashboard or via API)
kubectl port-forward -n kube-system svc/traefik 9000:9000
```

**Nginx:**
```bash
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -f
```

### PVC Issues

```bash
# PVC status
kubectl describe pvc golf-handicap-data

# Longhorn volumes
kubectl get volumes -n longhorn-system

# Longhorn events
kubectl get events -n longhorn-system --sort-by='.lastTimestamp'
```

## Best Practices

### 1. Resource Limits

The deployments already have sensible limits:
- Frontend: 64Mi-128Mi RAM, 100m-200m CPU
- Backend: 128Mi-256Mi RAM, 100m-500m CPU

### 2. Health Checks

Both services have health checks:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
```

### 3. Secrets

For production, use secrets:
```bash
kubectl create secret generic golf-handicap-secrets \
  --from-literal=db-password=your-password
```

### 4. Backups

Automate backups with a CronJob:
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: golf-handicap-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
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

Integrate Prometheus for monitoring:
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

## Production Checklist

- [ ] Images pushed to private registry
- [ ] Domain configured and DNS set up
- [ ] TLS certificates with cert-manager
- [ ] Resource limits adjusted
- [ ] Backup strategy implemented
- [ ] Monitoring set up
- [ ] Logs aggregated (e.g., with Loki)
- [ ] Secrets instead of plain text
- [ ] Network policies (optional)
- [ ] Pod security policies

## Support

If you encounter problems:
1. Check the logs (`make logs` / `make backend-logs`)
2. Verify PVC status (`make pvc-status`)
3. Check ingress logs
4. See `k8s/README.md` for detailed troubleshooting
