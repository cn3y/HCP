# CLAUDE.md

Guide for AI assistants working on the Golf Handicap Tracker (HCP) codebase.

## Project Overview

A full-stack web application for tracking golf handicaps using the World Handicap System (WHS). The frontend is a React/TypeScript SPA served by Nginx; the backend is an Express.js REST API with SQLite persistence. The project supports Docker Compose (dev and prod) and Kubernetes deployments.

## Repository Structure

```
/
├── src/                    # Frontend React application (TypeScript)
│   ├── components/         # React components (HandicapCard, WhatIfCard, HandicapChart, RoundForm, RoundsList)
│   ├── services/api.ts     # Centralized API client (ApiService singleton)
│   ├── utils/              # Business logic (WHS handicap calculations)
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point
│   ├── types.ts            # Shared TypeScript interfaces (GolfRound, RoundType, HandicapHistory)
│   └── index.css           # Global styles (Tailwind)
├── server/                 # Backend Express.js application (JavaScript)
│   ├── src/index.js        # Express server with REST API routes
│   ├── src/database.js     # SQLite setup, schema, prepared statements
│   ├── Dockerfile          # Backend container (Node 20 Alpine)
│   └── package.json        # Backend dependencies
├── k8s/                    # Kubernetes manifests (base + overlays for Traefik/Nginx)
├── nginx/                  # Nginx reverse proxy config (production)
├── .github/workflows/      # CI/CD (build-and-deploy.yaml, docker-publish.yml)
├── Dockerfile              # Frontend multi-stage build (build → Nginx)
├── Dockerfile.dev          # Frontend dev container (Vite dev server)
├── docker-compose.yml      # Development environment
├── docker-compose.prod.yml # Production with Nginx reverse proxy
├── docker-compose.ghcr.yml # Pre-built GHCR images
├── Makefile                # Build automation (Docker, K8s, compose, db ops)
├── package.json            # Frontend dependencies and scripts
├── vite.config.ts          # Vite bundler configuration
├── tailwind.config.js      # TailwindCSS with custom golf-green theme
├── eslint.config.js        # ESLint flat config (TypeScript + React)
├── tsconfig.json           # Root TypeScript config (references app + node)
├── tsconfig.app.json       # Frontend TS config (strict mode, ES2022)
└── tsconfig.node.json      # Node TS config
```

## Tech Stack

| Layer      | Technology                                                    |
|------------|---------------------------------------------------------------|
| Frontend   | React 19, TypeScript ~5.9, Vite 7, TailwindCSS 4, Recharts 3 |
| Backend    | Node.js 20, Express 5, better-sqlite3, Helmet, CORS          |
| Build      | Vite (frontend), Docker multi-stage, Makefile                 |
| Deploy     | Docker Compose, Kubernetes (Traefik or Nginx ingress)         |
| Registry   | GitHub Container Registry (ghcr.io/cn3y/hcp/*)               |
| CI/CD      | GitHub Actions                                                |

## Development Commands

### Frontend

```bash
npm install           # Install frontend dependencies
npm run dev           # Start Vite dev server (port 5173)
npm run build         # TypeScript check + Vite production build
npm run lint          # Run ESLint
npm run preview       # Preview production build locally
```

### Backend

```bash
cd server
npm install           # Install backend dependencies
npm run dev           # Start with nodemon (hot-reload, port 3001)
npm start             # Start production server
```

### Both (via Makefile)

```bash
make install          # Install all dependencies (frontend + backend)
make dev              # Start frontend dev server
make compose-up       # Start full stack via Docker Compose (dev)
make compose-down     # Stop Docker Compose
make build            # Build Docker images (frontend + backend)
make push             # Push images to registry
make deploy           # Deploy to Kubernetes (default: Traefik ingress)
```

### Database

```bash
make db-backup        # Backup SQLite database from K8s pod
make db-restore FILE=backup.db  # Restore database
```

## Build & Verification

Before submitting changes, run:

```bash
npm run build         # Runs tsc -b && vite build (catches type errors)
npm run lint          # ESLint with TypeScript rules
```

The `npm run build` command runs the TypeScript compiler first (`tsc -b`), then Vite. This catches both type errors and build issues.

Tests are not yet implemented (`npm run test` is a placeholder that exits 0).

## Code Conventions

### TypeScript (Frontend)

- **Strict mode** enabled: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`)
- PascalCase for components, types, and interfaces
- camelCase for variables, functions, and props
- Functional components with hooks only (no class components)
- Named exports for components; default export only for `App`

### JavaScript (Backend)

- snake_case for database column names (`course_name`, `round_type`)
- camelCase for JavaScript variables and API response fields
- The backend maps between these two conventions in route handlers
- Prepared statements for all database queries (security)
- Environment variables for configuration with sensible defaults

### Styling

- TailwindCSS utility classes for all styling
- Custom theme colors defined in `tailwind.config.js` (golf-green palette)
- No separate CSS modules or styled-components

### Error Handling

- Frontend: try/catch in async operations, error state managed via `useState`
- Backend: HTTP status codes (400 validation, 404 not found, 500 server error)
- Backend responses follow `{ success: boolean, error?: string, data?: T }` shape

## API Endpoints

All endpoints are under `/api`:

| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| GET    | /api/rounds       | List rounds (filterable by type) |
| POST   | /api/rounds       | Create a new round       |
| GET    | /api/rounds/:id   | Get a specific round     |
| PUT    | /api/rounds/:id   | Update a round           |
| DELETE | /api/rounds/:id   | Delete a round           |
| GET    | /api/stats        | Get statistics           |
| GET    | /health           | Health check             |

## Database Schema

SQLite database with a single `rounds` table:

```sql
CREATE TABLE rounds (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  course_name TEXT NOT NULL,
  course_rating REAL NOT NULL,
  slope_rating INTEGER NOT NULL,
  score INTEGER NOT NULL,
  par INTEGER NOT NULL,
  round_type TEXT CHECK(round_type IN ('official', 'training')),
  differential_score REAL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Git Conventions

- **Commit messages**: Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`)
- **Branches**: Feature branches via pull requests into `main`
- **CI**: GitHub Actions runs lint, build, and test on PRs and pushes to main

## Environment Variables

### Frontend (Vite)
- `VITE_API_URL` - Backend API base URL (default: `/api` in production, `http://localhost:3001/api` in dev)

### Backend
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed CORS origin
- `DB_PATH` - SQLite database file path

See `.env.example` for the full template.

## Architecture Notes

- The frontend is a single-page application; Nginx handles SPA routing (`try_files $uri /index.html`)
- In production, Nginx reverse proxy routes `/api` requests to the backend and `/` to the frontend
- The WHS handicap calculation logic lives entirely in `src/utils/handicapCalculator.ts`
- "Training" rounds are what-if scenarios that don't affect the official handicap index
- The `ApiService` class in `src/services/api.ts` is the single point of contact for all backend communication
