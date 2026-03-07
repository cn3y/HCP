# Golf Handicap Tracker

A modern web application for tracking your golf handicap. Track your development in golf with appealing visualizations and detailed statistics.

## Features

- 📊 **Handicap Calculation** based on World Handicap System (WHS)
- 📈 **Visual Display** of your handicap development
- 💾 **Server-side SQLite Database** for secure data storage
- 🎯 **Official & Training Rounds** - Distinguish between official rounds and "what-if" scenarios
- 🧮 **What-If Mode** - See how training rounds would affect your handicap
- 📱 **Responsive Design** for Desktop, Tablet, and Mobile
- 🎯 **Detailed Round Overview** with Score Differentials
- 📝 **Round Notes** - Record weather conditions and special notes
- ✨ **Modern UI** with TailwindCSS

## Technology Stack

### Frontend
- **React 19** - Modern UI Framework
- **TypeScript** - Type-safe development
- **Vite 7** - Fast build process
- **TailwindCSS 4** - Utility-First CSS Framework
- **Recharts** - Data visualization
- **Lucide React** - Modern icons

### Backend
- **Node.js + Express 5** - RESTful API Server
- **SQLite (better-sqlite3)** - Lightweight, serverless database
- **Helmet 8** - Security Middleware
- **CORS** - Cross-Origin Resource Sharing
- **express-rate-limit** - Rate limiting protection

### Deployment
- **Docker**: nginx reverse proxy for production
- **Kubernetes**: Traefik Ingress Controller (default)

### Pre-built Docker Images
- **Frontend**: `ghcr.io/cn3y/hcp/frontend:latest`
- **Backend**: `ghcr.io/cn3y/hcp/backend:latest`

See **[GITHUB-CONTAINER-REGISTRY.md](./GITHUB-CONTAINER-REGISTRY.md)** for details.

## Installation

### Quick Start with Docker Compose (Recommended)

**Option 1: Using pre-built images from GitHub Container Registry**
```bash
# Pull and run pre-built images (no build required)
docker-compose -f docker-compose.ghcr.yml up -d

# Access: http://localhost
```

**Option 2: Build locally for development**
```bash
# Build and run locally with hot reload
docker-compose up

# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

### Manual Installation

#### Backend

```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Configure database (SQLite or PostgreSQL)
# DB_TYPE=sqlite (default)
# DB_TYPE=postgres for PostgreSQL

# Start backend server
npm start
```

#### Frontend

```bash
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Create production build
npm run build
```

### PostgreSQL Setup

For PostgreSQL database support:

```bash
# Create .env file
cp .env.example .env

# Set database type to PostgreSQL
DB_TYPE=postgres

# Configure PostgreSQL connection (Option 1: individual vars)
PG_HOST=localhost
PG_PORT=5432
PG_USER=golf
PG_PASSWORD=your_password
PG_DATABASE=golf_handicap

# Or Option 2: connection string
# DATABASE_URL=postgresql://user:password@host:5432/database

# Initialize database (creates tables if not exist)
npm run init-db

# Start backend server
npm start
```

**Database Schema:**
- `players` table with `handicap_index`, `start_handicap`, `birth_date`
- `rounds` table with `date`, `course_name`, `course_rating`, `slope_rating`, `score`, `par`, `holes`, `round_type`, `differential_score`, `notes`

## Usage

1. **Add Round**: Click "Add New Round" and enter your golf round details:
   - Date of the round
   - Course name
   - Course Rating
   - Slope Rating
   - Your Score
   - Course Par
   - **Round Type**: Choose between:
     - **Official Round**: Counts toward your official handicap
     - **Training Round**: "What-if" scenario, doesn't count toward handicap
   - Optional notes (e.g., weather conditions)

2. **Track Handicap**: Your current handicap is automatically calculated and displayed on the main card.

3. **"What-If" Scenarios**:
   - Training rounds are tracked separately
   - See in the blue card what your handicap would look like if training rounds counted
   - Perfect for testing improvements!

4. **Analyze Development**: The chart shows your handicap development over all official rounds.

5. **Manage Rounds**: In the rounds list you see all rounds with badges (Official/Training). Rounds can be deleted at any time.

## Handicap Calculation

The application uses a simplified version of the World Handicap System (WHS):

1. **Score Differential**: `(113 / Slope Rating) × (Score - Course Rating)`
2. **Handicap Index**: Average of best Score Differentials × 0.96

The number of rounds used varies based on total rounds played:
- 1-5 rounds: best 1
- 6-8 rounds: best 2
- 9-11 rounds: best 3
- 12-14 rounds: best 4
- 15-16 rounds: best 5
- 17-18 rounds: best 6
- 19 rounds: best 7
- 20+ rounds: best 8

## Data Storage

All data is stored server-side in a SQLite database:
- **Persistent**: Data persists after browser reload
- **Secure**: SQLite is a proven, robust database
- **Portable**: Database file can be easily backed up
- **Local**: With local installation, your data stays on your server

### API Endpoints

The application uses the following REST API endpoints:

- `GET /api/rounds` - Fetch all rounds (with optional type filter)
- `GET /api/rounds/:id` - Fetch single round
- `POST /api/rounds` - Create new round
- `PUT /api/rounds/:id` - Update round
- `DELETE /api/rounds/:id` - Delete round
- `GET /api/statistics` - Fetch statistics
- `GET /health` - Health Check

## Browser Compatibility

The application works in all modern browsers:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Deployment

The application supports multiple deployment options:

### 📦 Docker Deployment (nginx reverse proxy)

For Docker-based deployments, we use **nginx as reverse proxy** in production.

See **[DOCKER-DEPLOYMENT.md](./DOCKER-DEPLOYMENT.md)** for detailed instructions including:
- Development setup (docker-compose.yml)
- Production setup with nginx (docker-compose.prod.yml)
- SSL/TLS configuration
- Backup & restore procedures

**Quick Start:**
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### ☸️ Kubernetes Deployment (Traefik Ingress)

For Kubernetes deployments, we use **Traefik as Ingress Controller** by default.

See **[k8s/README.md](./k8s/README.md)** for comprehensive Kubernetes deployment guide including:
- Traefik Ingress setup (default)
- Nginx Ingress alternative
- Longhorn storage configuration
- TLS/SSL with cert-manager
- Monitoring & troubleshooting

**Quick Start:**
```bash
# Deploy with Traefik (default)
kubectl apply -k k8s/

# Or with Nginx Ingress
kubectl apply -k k8s/overlays/nginx/
```

---

## Legacy Kubernetes Deployment (Basic)

The application can be deployed in a Kubernetes environment.

### Prerequisites

- Docker installed and configured
- Access to a Container Registry (Docker Hub, GHCR, etc.)
- kubectl installed and connected to the cluster
- Traefik or Nginx Ingress Controller in cluster

### 1. Build and Push Docker Image

```bash
# Build image
docker build -t your-registry/golf-handicap-tracker:latest .

# Test image (optional)
docker run -p 8080:80 your-registry/golf-handicap-tracker:latest

# Push image
docker push your-registry/golf-handicap-tracker:latest
```

### 2. Customize Kubernetes Manifests

Adjust values in `k8s/deployment.yaml`:
- Replace `your-registry/golf-handicap-tracker:latest` with your image URL

Adjust `k8s/ingress.yaml`:
- Change `golf-handicap.example.com` to your domain
- Uncomment TLS configuration if desired

### 3. Deployment with kubectl

```bash
# Deploy all resources
kubectl apply -f k8s/

# Or with Kustomize
kubectl apply -k k8s/

# Check status
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
```

### 4. Verify Deployment

```bash
# View logs
kubectl logs -l app=golf-handicap-tracker

# Show pod details
kubectl describe pod -l app=golf-handicap-tracker

# Port-forward for local test (without Ingress)
kubectl port-forward svc/golf-handicap-tracker 8080:80
# Open http://localhost:8080
```

### 5. Deploy Update

```bash
# Build and push new image
docker build -t your-registry/golf-handicap-tracker:v1.1.0 .
docker push your-registry/golf-handicap-tracker:v1.1.0

# Update deployment
kubectl set image deployment/golf-handicap-tracker \
  golf-handicap-tracker=your-registry/golf-handicap-tracker:v1.1.0

# Monitor rollout status
kubectl rollout status deployment/golf-handicap-tracker
```

### 6. Scaling

```bash
# Change number of replicas
kubectl scale deployment/golf-handicap-tracker --replicas=5

# Horizontal Pod Autoscaler (optional)
kubectl autoscale deployment golf-handicap-tracker \
  --cpu-percent=70 --min=3 --max=10
```

### Kubernetes Resources

The following Kubernetes resources are deployed:

- **Deployment**: 3 Replicas with Rolling Update strategy
- **Service**: ClusterIP Service on port 80
- **Ingress**: Nginx Ingress for external access (optional)

### Health Checks

The application provides a health check endpoint:
- **URL**: `/health`
- **Liveness Probe**: Checks every 30 seconds
- **Readiness Probe**: Checks every 10 seconds

### Resource Requirements

- **Requests**: 64Mi RAM, 100m CPU
- **Limits**: 128Mi RAM, 200m CPU

These values can be adjusted in `k8s/deployment.yaml`.

## License

MIT
