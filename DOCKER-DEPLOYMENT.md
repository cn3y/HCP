# Docker Deployment Guide

This guide explains how to deploy the Golf Handicap Tracker using Docker and Docker Compose.

## Overview

The application uses **nginx as reverse proxy** for all Docker-based deployments in production.

### Architecture

```
         ┌─────────────┐
         │   nginx     │ :80, :443 (Reverse Proxy)
         │  (Alpine)   │
         └──────┬──────┘
                │
        ┌───────┴───────┐
        │               │
   ┌────▼─────┐   ┌────▼────┐
   │ Frontend │   │ Backend │
   │  React   │   │ Node.js │
   │  +nginx  │   │ Express │
   └──────────┘   └────┬────┘
                       │
                  ┌────▼────┐
                  │ SQLite  │
                  │   DB    │
                  └─────────┘
```

## Pre-built Images (GitHub Container Registry)

**Quick Start** - Use pre-built images without building locally:

```bash
# Pull and run pre-built images
docker-compose -f docker-compose.ghcr.yml up -d

# Access application: http://localhost
```

See **[GITHUB-CONTAINER-REGISTRY.md](./GITHUB-CONTAINER-REGISTRY.md)** for complete GHCR documentation.

---

## Deployment Options

### 1. Development Setup (Recommended for Development)

Uses Vite dev server for hot module replacement:

```bash
# Start development environment
docker-compose up

# Access application
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

**Services:**
- **Frontend**: Vite dev server with HMR on port 5173
- **Backend**: Node.js Express API on port 3001
- **No nginx proxy** (direct access to services)

### 2. Production Setup (Recommended for Production)

Uses nginx as reverse proxy with production builds:

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Access application
# All traffic through nginx: http://localhost
```

**Services:**
- **nginx**: Reverse proxy handling all traffic (port 80/443)
- **Frontend**: Production React build served by nginx
- **Backend**: Node.js Express API (internal only)
- **Volumes**: Persistent SQLite database storage

## Configuration Files

### docker-compose.yml (Development)
```yaml
services:
  backend:    # Direct access on :3001
  frontend:   # Vite dev server on :5173
```

### docker-compose.prod.yml (Production)
```yaml
services:
  nginx:      # Reverse proxy on :80, :443
  frontend:   # Production build (internal)
  backend:    # API server (internal)
```

### nginx/nginx-proxy.conf
- Routes `/api/*` → Backend service (port 3001)
- Routes `/*` → Frontend service (port 80)
- Static asset caching (1 year)
- Security headers (HSTS, X-Frame-Options, etc.)
- Gzip compression enabled

## Production Deployment

### Step 1: Build Images

```bash
# Build frontend production image
docker build -t golf-handicap-frontend:latest .

# Build backend production image
docker build -t golf-handicap-backend:latest ./server
```

### Step 2: Start Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Step 3: Verify Deployment

```bash
# Check nginx is running
curl http://localhost/health

# Check backend API
curl http://localhost/api/rounds

# Access frontend
# Open browser: http://localhost
```

## Environment Variables

### Backend (.env)

```bash
PORT=3001
DB_PATH=/app/data/golf-handicap.db
CORS_ORIGIN=http://localhost
NODE_ENV=production
```

### Frontend (Build Args)

```bash
VITE_API_URL=/api  # Relative URL for production
```

## SSL/TLS Configuration

To enable HTTPS in production:

### 1. Obtain SSL Certificates

```bash
# Using Let's Encrypt
mkdir -p nginx/ssl
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

### 2. Update nginx-proxy.conf

Uncomment the HTTPS server block in `nginx/nginx-proxy.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # ... rest of configuration
}
```

### 3. Update docker-compose.prod.yml

Ensure SSL volume is mounted:

```yaml
nginx:
  volumes:
    - ./nginx/ssl:/etc/nginx/ssl:ro
```

### 4. Restart Services

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

## Volumes & Data Persistence

### SQLite Database

The backend uses a persistent volume for the SQLite database:

```yaml
volumes:
  golf-data:
    driver: local
```

**Data Location**: `/var/lib/docker/volumes/hcp_golf-data/_data/`

### Backup Database

```bash
# Find backend container
CONTAINER=$(docker-compose -f docker-compose.prod.yml ps -q backend)

# Backup database
docker cp $CONTAINER:/app/data/golf-handicap.db ./backup-$(date +%Y%m%d).db
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup.db $CONTAINER:/app/data/golf-handicap.db

# Restart backend
docker-compose -f docker-compose.prod.yml restart backend
```

## Health Checks

All services include health checks:

### Frontend
```bash
wget --spider -q http://frontend/
```

### Backend
```bash
wget --spider -q http://backend:3001/health
```

### nginx
```bash
wget --spider -q http://localhost/health
```

## Monitoring & Logs

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Resource Usage

```bash
# Container stats
docker stats

# Specific compose project
docker-compose -f docker-compose.prod.yml ps
```

## Scaling

### Scale Frontend

```bash
docker-compose -f docker-compose.prod.yml up -d --scale frontend=3
```

nginx will automatically load balance across frontend instances.

## Troubleshooting

### nginx Cannot Connect to Backend

```bash
# Check network
docker network ls
docker network inspect hcp_golf-network

# Check backend is running
docker-compose -f docker-compose.prod.yml ps backend

# Test from nginx container
docker-compose -f docker-compose.prod.yml exec nginx ping backend
```

### Database Permission Issues

```bash
# Check volume permissions
docker-compose -f docker-compose.prod.yml exec backend ls -la /app/data/

# Fix permissions
docker-compose -f docker-compose.prod.yml exec backend chown -R node:node /app/data/
```

### Port Conflicts

```bash
# Check what's using port 80
sudo lsof -i :80

# Use different port
# Edit docker-compose.prod.yml:
nginx:
  ports:
    - "8080:80"  # Changed from 80:80
```

## Cleanup

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: Deletes database!)
docker-compose -f docker-compose.prod.yml down -v

# Remove images
docker rmi golf-handicap-frontend:latest
docker rmi golf-handicap-backend:latest
```

## Best Practices

1. **Always use docker-compose.prod.yml in production**
2. **Enable SSL/TLS for public deployments**
3. **Backup database regularly**
4. **Monitor logs for errors**
5. **Use environment variables for sensitive config**
6. **Keep Docker images updated**
7. **Set resource limits in production**:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Summary

| Environment | Setup | nginx | Access |
|------------|-------|-------|--------|
| **Development** | `docker-compose up` | ❌ No | Frontend: `:5173`<br>Backend: `:3001` |
| **Production** | `docker-compose -f docker-compose.prod.yml up -d` | ✅ Yes | All via nginx: `:80` |

**Key Point**: Docker deployments use **nginx as reverse proxy** in production for optimal performance, security, and routing.
