# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Golf Handicap Tracker application.

## Overview

The application consists of two main components:
- **Frontend** (React + Nginx): Static web application
- **Backend** (Node.js + Express): REST API with SQLite database

## Deployment Options

### Option 1: With Traefik Ingress (Recommended for Longhorn)

Use this option if you have Traefik as your Ingress Controller:

```bash
# With Kustomize
kubectl apply -k overlays/traefik/

# Or manually
kubectl apply -f pvc.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress-traefik.yaml
```

### Option 2: With Nginx Ingress

Use this option if you have Nginx Ingress Controller:

```bash
# With Kustomize
kubectl apply -k overlays/nginx/

# Or manually
kubectl apply -f pvc.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## Prerequisites

### 1. Storage Class (Longhorn)

The application uses Longhorn as the default Storage Class:

```bash
# Check if Longhorn is available
kubectl get storageclass longhorn

# Optional: Set as default Storage Class
kubectl patch storageclass longhorn -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

If you want to use a different Storage Class, change `storageClassName` in `pvc.yaml`.

### 2. Ingress Controller

**Traefik (recommended):**
```bash
# Check if Traefik is running
kubectl get pods -n kube-system | grep traefik
```

**Nginx:**
```bash
# Check if Nginx Ingress is running
kubectl get pods -n ingress-nginx
```

## Configuration

### Customize Manifests

1. **Ingress Domain** in `ingress-traefik.yaml` or `ingress.yaml`:
   ```yaml
   spec:
     rules:
     - host: golf-handicap.your-domain.com  # <- Change this
   ```

2. **Container Images** in `deployment.yaml` and `backend-deployment.yaml`:
   ```yaml
   image: your-registry/golf-handicap-tracker:latest  # <- Change this
   ```

3. **Namespace** (optional):
   ```bash
   # Create namespace
   kubectl create namespace golf-tracker

   # Adjust in kustomization.yaml
   namespace: golf-tracker
   ```

4. **Storage Size** in `pvc.yaml`:
   ```yaml
   resources:
     requests:
       storage: 5Gi  # Default: 1Gi
   ```

## Resource Overview

### Frontend (deployment.yaml)
- **Replicas**: 3
- **Resources**: 64Mi-128Mi RAM, 100m-200m CPU
- **Port**: 80
- **Image**: Nginx with React build

### Backend (backend-deployment.yaml)
- **Replicas**: 2
- **Resources**: 128Mi-256Mi RAM, 100m-500m CPU
- **Port**: 3001
- **Image**: Node.js with Express API
- **Volume**: SQLite database on Longhorn PVC

### Persistent Volume
- **Storage**: 1Gi (adjustable)
- **Access Mode**: ReadWriteOnce
- **Storage Class**: longhorn

### Services
- **golf-handicap-tracker**: ClusterIP on port 80 (Frontend)
- **golf-handicap-backend**: ClusterIP on port 3001 (Backend)

### Ingress
- **Frontend**: `/` → Port 80
- **Backend API**: `/api` → Port 3001
- **TLS**: Supported with cert-manager

## TLS/HTTPS with cert-manager

### Install cert-manager (if not present)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Create ClusterIssuer

```bash
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

### Enable TLS in Ingress

TLS configuration is already prepared in the Ingress manifests. Simply uncomment:

```yaml
# In ingress-traefik.yaml or ingress.yaml
annotations:
  cert-manager.io/cluster-issuer: "letsencrypt-prod"  # <- Uncomment

tls:
  - hosts:
    - golf-handicap.example.com
    secretName: golf-handicap-tracker-tls  # <- Uncomment
```

## Monitoring & Debugging

### Check Status

```bash
# All resources
kubectl get all -l app=golf-handicap-tracker

# PVC status
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

### Access Pod

```bash
# Backend pod
kubectl exec -it deployment/golf-handicap-backend -- sh

# Check database
ls -la /app/data/
```

### Port-Forward for Local Testing

```bash
# Frontend
kubectl port-forward svc/golf-handicap-tracker 8080:80

# Backend
kubectl port-forward svc/golf-handicap-backend 3001:3001

# Then open: http://localhost:8080
```

## Scaling

```bash
# Scale frontend
kubectl scale deployment/golf-handicap-tracker --replicas=5

# Scale backend
kubectl scale deployment/golf-handicap-backend --replicas=3

# Enable HPA
kubectl autoscale deployment/golf-handicap-tracker --cpu-percent=70 --min=3 --max=10
kubectl autoscale deployment/golf-handicap-backend --cpu-percent=70 --min=2 --max=5
```

## Backup & Restore

### Backup Database

```bash
# Find pod
POD=$(kubectl get pod -l app=golf-handicap-backend -o jsonpath='{.items[0].metadata.name}')

# Copy database
kubectl cp $POD:/app/data/golf-handicap.db ./backup-$(date +%Y%m%d).db
```

### Restore Database

```bash
# Copy to pod
kubectl cp ./backup.db $POD:/app/data/golf-handicap.db

# Restart pod
kubectl rollout restart deployment/golf-handicap-backend
```

## Cleanup

```bash
# With Kustomize
kubectl delete -k overlays/traefik/
# or
kubectl delete -k overlays/nginx/

# Manually
kubectl delete ingress golf-handicap-tracker
kubectl delete service golf-handicap-tracker golf-handicap-backend
kubectl delete deployment golf-handicap-tracker golf-handicap-backend
kubectl delete pvc golf-handicap-data
```

## Troubleshooting

### PVC Stuck in Pending Status

```bash
# Check Longhorn
kubectl get pods -n longhorn-system

# Check Storage Classes
kubectl get storageclass
```

### Ingress Not Working

**Traefik:**
```bash
# Traefik status
kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik

# Traefik logs
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik
```

**Nginx:**
```bash
# Nginx Ingress status
kubectl get pods -n ingress-nginx

# Nginx logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### Backend Cannot Access Database

```bash
# Check volume mount
kubectl describe pod -l app=golf-handicap-backend

# Access pod and check
kubectl exec -it deployment/golf-handicap-backend -- sh
ls -la /app/data/
touch /app/data/test.txt  # Test write permissions
```

### Image Pull Error

```bash
# Create ImagePullSecret
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=TOKEN

# Reference in Deployment:
spec:
  template:
    spec:
      imagePullSecrets:
      - name: regcred
```
