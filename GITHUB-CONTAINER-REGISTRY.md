# GitHub Container Registry (GHCR) - Docker Images

Dieses Repository veröffentlicht automatisch Docker Images auf GitHub Container Registry (ghcr.io).

## 📦 Verfügbare Images

Die folgenden Docker Images werden automatisch gebaut und veröffentlicht:

### Frontend Image
```
ghcr.io/cn3y/hcp/frontend:latest
```

### Backend Image
```
ghcr.io/cn3y/hcp/backend:latest
```

## 🚀 Automatisches Bauen

Docker Images werden automatisch gebaut durch GitHub Actions bei:

- **Push auf `main` oder `master` Branch** → `latest` Tag
- **Git Tags `v*.*.*`** → Versions-Tags (z.B. `v1.2.3`, `1.2`, `1`)
- **Pull Requests** → Test-Build (wird nicht gepusht)
- **Manueller Trigger** → Via GitHub Actions UI

### Tag-Strategie

| Trigger | Beispiel-Tags |
|---------|--------------|
| `main` Branch | `latest`, `main`, `main-abc123` |
| Tag `v1.2.3` | `1.2.3`, `1.2`, `1`, `latest` |
| PR #42 | `pr-42` |
| Branch `feature/x` | `feature-x`, `feature-x-abc123` |

## 📥 Images Verwenden

### 1. Öffentliche Images (ohne Login)

Wenn das Repository öffentlich ist, können die Images direkt verwendet werden:

```bash
# Frontend
docker pull ghcr.io/cn3y/hcp/frontend:latest

# Backend
docker pull ghcr.io/cn3y/hcp/backend:latest

# Specific version
docker pull ghcr.io/cn3y/hcp/frontend:1.2.3
```

### 2. Private Images (mit Login)

Für private Repositories ist ein Login erforderlich:

```bash
# Login with Personal Access Token (PAT)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/cn3y/hcp/frontend:latest
docker pull ghcr.io/cn3y/hcp/backend:latest
```

#### Personal Access Token (PAT) erstellen

1. Gehe zu GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Wähle Scope: `read:packages` (zum Pullen) oder `write:packages` (zum Pushen)
4. Kopiere den Token

## 🐳 Docker Compose mit GHCR Images

### docker-compose.ghcr.yml

```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/cn3y/hcp/backend:latest
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - DB_PATH=/app/data/golf-handicap.db
      - CORS_ORIGIN=http://localhost:5173
      - NODE_ENV=production
    volumes:
      - golf-data:/app/data
    restart: unless-stopped

  frontend:
    image: ghcr.io/cn3y/hcp/frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  golf-data:
```

**Verwendung:**
```bash
docker-compose -f docker-compose.ghcr.yml up -d
```

## ☸️ Kubernetes mit GHCR Images

### Deployment aktualisieren

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: golf-handicap-tracker
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: ghcr.io/cn3y/hcp/frontend:latest
        # oder spezifische Version
        # image: ghcr.io/cn3y/hcp/frontend:1.2.3
```

### ImagePullSecret für private Images

```bash
# Create secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN

# Reference in deployment
spec:
  template:
    spec:
      imagePullSecrets:
      - name: ghcr-secret
      containers:
      - name: frontend
        image: ghcr.io/cn3y/hcp/frontend:latest
```

### Mit Kustomize

```bash
# Aktualisiere k8s/deployment.yaml und k8s/backend-deployment.yaml
# Dann:
kubectl apply -k k8s/
```

## 🔧 Multi-Architecture Support

Die Images werden für folgende Architekturen gebaut:

- ✅ **linux/amd64** - Standard x86_64 (Intel/AMD)
- ✅ **linux/arm64** - ARM64 (Apple Silicon, Raspberry Pi 4+, AWS Graviton)

Docker wählt automatisch die richtige Architektur für Ihr System.

## 🔄 Neue Version Veröffentlichen

### Option 1: Git Tag erstellen

```bash
# Tag erstellen
git tag v1.2.3
git push origin v1.2.3

# GitHub Actions baut automatisch:
# - ghcr.io/cn3y/hcp/frontend:1.2.3
# - ghcr.io/cn3y/hcp/frontend:1.2
# - ghcr.io/cn3y/hcp/frontend:1
# - ghcr.io/cn3y/hcp/frontend:latest
```

### Option 2: Push to Main

```bash
# Normaler Push
git push origin main

# GitHub Actions baut automatisch:
# - ghcr.io/cn3y/hcp/frontend:latest
# - ghcr.io/cn3y/hcp/frontend:main
```

### Option 3: Manueller Trigger

1. Gehe zu GitHub → Actions → "Build and Push Docker Images"
2. Click "Run workflow"
3. Wähle Branch
4. Click "Run workflow"

## 📊 Image Versionen Anzeigen

### Via GitHub UI

1. Gehe zu Repository → Packages
2. Click auf Package (frontend/backend)
3. Sieh alle verfügbaren Tags/Versionen

### Via GitHub API

```bash
# List all versions of frontend image
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/users/cn3y/packages/container/hcp%2Ffrontend/versions

# List all versions of backend image
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/users/cn3y/packages/container/hcp%2Fbackend/versions
```

### Via Docker

```bash
# Mit crane (https://github.com/google/go-containerregistry/tree/main/cmd/crane)
crane ls ghcr.io/cn3y/hcp/frontend

# Mit skopeo
skopeo list-tags docker://ghcr.io/cn3y/hcp/frontend
```

## 🔐 Sicherheit

### Package Visibility

Standardmäßig sind Packages **privat**. Um sie öffentlich zu machen:

1. Gehe zu Package Settings (auf Package-Seite)
2. Scroll zu "Danger Zone"
3. Click "Change visibility"
4. Wähle "Public"

### Alte Versionen Löschen

GitHub berechnet Storage für alte Image-Versionen. Automatisches Cleanup:

1. Gehe zu Repository → Settings → Actions → General
2. Scroll zu "Artifact and log retention"
3. Oder verwende GitHub's Package cleanup policies

**Manuell löschen:**
```bash
# Via GitHub API
curl -X DELETE \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user/packages/container/hcp%2Ffrontend/versions/VERSION_ID
```

## 🛠️ Troubleshooting

### "permission denied" beim Push

```bash
# Stelle sicher, dass GITHUB_TOKEN die richtigen Permissions hat
# In Workflow: permissions.packages: write muss gesetzt sein
```

### Image nicht gefunden

```bash
# Prüfe Package-Namen
# Format: ghcr.io/OWNER/REPO/IMAGE:TAG
# Beispiel: ghcr.io/cn3y/hcp/frontend:latest

# Prüfe ob Image existiert
docker manifest inspect ghcr.io/cn3y/hcp/frontend:latest
```

### Rate Limits

GitHub Container Registry hat großzügige Rate Limits:
- **Authenticated**: 15,000 pulls/hour
- **Unauthenticated**: 1,000 pulls/hour (für public images)

## 📚 Weitere Informationen

- [GitHub Container Registry Dokumentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Docker Multi-Platform Images](https://docs.docker.com/build/building/multi-platform/)

## 💡 Best Practices

1. **Verwende spezifische Tags in Production**
   ```yaml
   # ❌ Nicht empfohlen
   image: ghcr.io/cn3y/hcp/frontend:latest

   # ✅ Empfohlen
   image: ghcr.io/cn3y/hcp/frontend:1.2.3
   ```

2. **Automatisches Update mit Renovate/Dependabot**
   - Verwende Renovate oder Dependabot für automatische Updates

3. **Image Scanning**
   - Aktiviere GitHub Security Features für Vulnerability Scanning

4. **Cache nutzen**
   - GitHub Actions nutzt bereits Layer-Caching für schnellere Builds

5. **Semantic Versioning**
   - Verwende `v1.2.3` Format für Tags
   - Major.Minor.Patch

## 🎯 Quick Reference

```bash
# Pull latest
docker pull ghcr.io/cn3y/hcp/frontend:latest
docker pull ghcr.io/cn3y/hcp/backend:latest

# Pull specific version
docker pull ghcr.io/cn3y/hcp/frontend:1.2.3

# Run frontend
docker run -p 80:80 ghcr.io/cn3y/hcp/frontend:latest

# Run backend
docker run -p 3001:3001 \
  -e DB_PATH=/app/data/golf-handicap.db \
  -v golf-data:/app/data \
  ghcr.io/cn3y/hcp/backend:latest

# Login (für private images)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Inspect image
docker manifest inspect ghcr.io/cn3y/hcp/frontend:latest
```
