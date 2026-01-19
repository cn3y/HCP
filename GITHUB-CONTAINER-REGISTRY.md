# GitHub Container Registry (GHCR) - Docker Images

This repository automatically publishes Docker Images to GitHub Container Registry (ghcr.io).

## 📦 Available Images

The following Docker Images are automatically built and published:

### Frontend Image
```
ghcr.io/cn3y/hcp/frontend:latest
```

### Backend Image
```
ghcr.io/cn3y/hcp/backend:latest
```

## 🚀 Automatic Builds

Docker Images are automatically built by GitHub Actions when:

- **Push to `main` or `master` branch** → `latest` tag
- **Git Tags `v*.*.*`** → Version tags (e.g., `v1.2.3`, `1.2`, `1`)
- **Pull Requests** → Test build (not pushed)
- **Manual trigger** → Via GitHub Actions UI

### Tag Strategy

| Trigger | Example Tags |
|---------|--------------|
| `main` Branch | `latest`, `main`, `main-abc123` |
| Tag `v1.2.3` | `1.2.3`, `1.2`, `1`, `latest` |
| PR #42 | `pr-42` |
| Branch `feature/x` | `feature-x`, `feature-x-abc123` |

## 📥 Using Images

### 1. Public Images (without login)

If the repository is public, the images can be used directly:

```bash
# Frontend
docker pull ghcr.io/cn3y/hcp/frontend:latest

# Backend
docker pull ghcr.io/cn3y/hcp/backend:latest

# Specific version
docker pull ghcr.io/cn3y/hcp/frontend:1.2.3
```

### 2. Private Images (with login)

For private repositories, login is required:

```bash
# Login with Personal Access Token (PAT)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/cn3y/hcp/frontend:latest
docker pull ghcr.io/cn3y/hcp/backend:latest
```

#### Create Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scope: `read:packages` (for pulling) or `write:packages` (for pushing)
4. Copy the token

## 🐳 Docker Compose with GHCR Images

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

**Usage:**
```bash
docker-compose -f docker-compose.ghcr.yml up -d
```

## ☸️ Kubernetes with GHCR Images

### Update Deployment

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
        # or specific version
        # image: ghcr.io/cn3y/hcp/frontend:1.2.3
```

### ImagePullSecret for private Images

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

### With Kustomize

```bash
# Update k8s/deployment.yaml and k8s/backend-deployment.yaml
# Then:
kubectl apply -k k8s/
```

## 🔧 Multi-Architecture Support

The images are built for the following architectures:

- ✅ **linux/amd64** - Standard x86_64 (Intel/AMD)
- ✅ **linux/arm64** - ARM64 (Apple Silicon, Raspberry Pi 4+, AWS Graviton)

Docker automatically selects the correct architecture for your system.

## 🔄 Publishing New Version

### Option 1: Create Git Tag

```bash
# Create tag
git tag v1.2.3
git push origin v1.2.3

# GitHub Actions automatically builds:
# - ghcr.io/cn3y/hcp/frontend:1.2.3
# - ghcr.io/cn3y/hcp/frontend:1.2
# - ghcr.io/cn3y/hcp/frontend:1
# - ghcr.io/cn3y/hcp/frontend:latest
```

### Option 2: Push to Main

```bash
# Normal push
git push origin main

# GitHub Actions automatically builds:
# - ghcr.io/cn3y/hcp/frontend:latest
# - ghcr.io/cn3y/hcp/frontend:main
```

### Option 3: Manual Trigger

1. Go to GitHub → Actions → "Build and Push Docker Images"
2. Click "Run workflow"
3. Select branch
4. Click "Run workflow"

## 📊 Display Image Versions

### Via GitHub UI

1. Go to Repository → Packages
2. Click on Package (frontend/backend)
3. View all available tags/versions

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
# With crane (https://github.com/google/go-containerregistry/tree/main/cmd/crane)
crane ls ghcr.io/cn3y/hcp/frontend

# With skopeo
skopeo list-tags docker://ghcr.io/cn3y/hcp/frontend
```

## 🔐 Security

### Package Visibility

By default, packages are **private**. To make them public:

1. Go to Package Settings (on package page)
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Select "Public"

### Delete Old Versions

GitHub charges storage for old image versions. Automatic cleanup:

1. Go to Repository → Settings → Actions → General
2. Scroll to "Artifact and log retention"
3. Or use GitHub's Package cleanup policies

**Delete manually:**
```bash
# Via GitHub API
curl -X DELETE \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user/packages/container/hcp%2Ffrontend/versions/VERSION_ID
```

## 🛠️ Troubleshooting

### "permission denied" during push

```bash
# Ensure that GITHUB_TOKEN has the correct permissions
# In workflow: permissions.packages: write must be set
```

### Image not found

```bash
# Check package name
# Format: ghcr.io/OWNER/REPO/IMAGE:TAG
# Example: ghcr.io/cn3y/hcp/frontend:latest

# Check if image exists
docker manifest inspect ghcr.io/cn3y/hcp/frontend:latest
```

### Rate Limits

GitHub Container Registry has generous rate limits:
- **Authenticated**: 15,000 pulls/hour
- **Unauthenticated**: 1,000 pulls/hour (for public images)

## 📚 Further Information

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Docker Multi-Platform Images](https://docs.docker.com/build/building/multi-platform/)

## 💡 Best Practices

1. **Use specific tags in production**
   ```yaml
   # ❌ Not recommended
   image: ghcr.io/cn3y/hcp/frontend:latest

   # ✅ Recommended
   image: ghcr.io/cn3y/hcp/frontend:1.2.3
   ```

2. **Automatic updates with Renovate/Dependabot**
   - Use Renovate or Dependabot for automatic updates

3. **Image Scanning**
   - Enable GitHub Security Features for vulnerability scanning

4. **Use cache**
   - GitHub Actions already uses layer caching for faster builds

5. **Semantic Versioning**
   - Use `v1.2.3` format for tags
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

# Login (for private images)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Inspect image
docker manifest inspect ghcr.io/cn3y/hcp/frontend:latest
```
