.PHONY: help build push deploy rollout logs scale clean test

# Variablen (überschreibbar mit Umgebungsvariablen)
REGISTRY ?= your-registry
IMAGE_NAME ?= golf-handicap-tracker
BACKEND_IMAGE_NAME ?= golf-handicap-backend
VERSION ?= latest
NAMESPACE ?= default
INGRESS ?= traefik

# Vollständige Image-Namen
FRONTEND_IMAGE = $(REGISTRY)/$(IMAGE_NAME):$(VERSION)
BACKEND_IMAGE = $(REGISTRY)/$(BACKEND_IMAGE_NAME):$(VERSION)

help: ## Zeigt diese Hilfe an
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Docker Images bauen (Frontend + Backend)
	@echo "Building Frontend image: $(FRONTEND_IMAGE)"
	docker build -t $(FRONTEND_IMAGE) .
	@echo "Building Backend image: $(BACKEND_IMAGE)"
	docker build -t $(BACKEND_IMAGE) ./server
	@echo "✓ Images erfolgreich gebaut"

build-frontend: ## Nur Frontend Image bauen
	@echo "Building Frontend image: $(FRONTEND_IMAGE)"
	docker build -t $(FRONTEND_IMAGE) .
	@echo "✓ Frontend Image erfolgreich gebaut"

build-backend: ## Nur Backend Image bauen
	@echo "Building Backend image: $(BACKEND_IMAGE)"
	docker build -t $(BACKEND_IMAGE) ./server
	@echo "✓ Backend Image erfolgreich gebaut"

test-local: build ## Image lokal testen
	@echo "Starte lokalen Test auf Port 8080..."
	docker run --rm -p 8080:80 $(IMAGE)

push: ## Docker Images in Registry pushen (Frontend + Backend)
	@echo "Pushing Frontend image: $(FRONTEND_IMAGE)"
	docker push $(FRONTEND_IMAGE)
	@echo "Pushing Backend image: $(BACKEND_IMAGE)"
	docker push $(BACKEND_IMAGE)
	@echo "✓ Images erfolgreich gepusht"

build-push: build push ## Build und Push in einem Schritt

deploy: ## In Kubernetes deployen mit gewähltem Ingress (INGRESS=traefik|nginx)
	@echo "Deploying to Kubernetes namespace: $(NAMESPACE) with $(INGRESS) ingress"
	kubectl apply -k k8s/overlays/$(INGRESS)/ -n $(NAMESPACE)
	@echo "✓ Deployment erfolgreich"

deploy-traefik: ## Deploy mit Traefik Ingress
	@echo "Deploying with Traefik Ingress to namespace: $(NAMESPACE)"
	kubectl apply -k k8s/overlays/traefik/ -n $(NAMESPACE)
	@echo "✓ Deployment erfolgreich"

deploy-nginx: ## Deploy mit Nginx Ingress
	@echo "Deploying with Nginx Ingress to namespace: $(NAMESPACE)"
	kubectl apply -k k8s/overlays/nginx/ -n $(NAMESPACE)
	@echo "✓ Deployment erfolgreich"

rollout: ## Rollout-Status anzeigen
	kubectl rollout status deployment/golf-handicap-tracker -n $(NAMESPACE)

logs: ## Logs der Pods anzeigen
	kubectl logs -l app=golf-handicap-tracker -n $(NAMESPACE) --tail=100 -f

status: ## Status aller Ressourcen anzeigen
	@echo "=== Deployments ==="
	kubectl get deployments -n $(NAMESPACE) -l app=golf-handicap-tracker
	@echo "\n=== Pods ==="
	kubectl get pods -n $(NAMESPACE) -l app=golf-handicap-tracker
	@echo "\n=== Services ==="
	kubectl get services -n $(NAMESPACE) -l app=golf-handicap-tracker
	@echo "\n=== Ingress ==="
	kubectl get ingress -n $(NAMESPACE) -l app=golf-handicap-tracker

scale: ## Deployment skalieren (nutze: make scale REPLICAS=5)
	@if [ -z "$(REPLICAS)" ]; then \
		echo "Fehler: REPLICAS nicht gesetzt. Beispiel: make scale REPLICAS=5"; \
		exit 1; \
	fi
	kubectl scale deployment/golf-handicap-tracker --replicas=$(REPLICAS) -n $(NAMESPACE)
	@echo "✓ Deployment auf $(REPLICAS) Replicas skaliert"

port-forward: ## Port-Forward für lokalen Zugriff (Port 8080)
	@echo "Port-Forward aktiv auf http://localhost:8080"
	kubectl port-forward svc/golf-handicap-tracker 8080:80 -n $(NAMESPACE)

delete: ## Alle Kubernetes-Ressourcen löschen
	@echo "Lösche alle Ressourcen aus namespace: $(NAMESPACE)"
	kubectl delete -f k8s/ -n $(NAMESPACE)
	@echo "✓ Alle Ressourcen gelöscht"

clean: ## Lokale Docker-Images aufräumen
	@echo "Entferne lokale Docker-Images..."
	docker rmi $(IMAGE) || true
	@echo "✓ Aufgeräumt"

update: build-push ## Build, Push und Update im Cluster
	@echo "Updating deployment with new image: $(IMAGE)"
	kubectl set image deployment/golf-handicap-tracker \
		golf-handicap-tracker=$(IMAGE) -n $(NAMESPACE)
	kubectl rollout status deployment/golf-handicap-tracker -n $(NAMESPACE)
	@echo "✓ Update erfolgreich"

dev: ## Lokaler Entwicklungsserver
	npm run dev

install: ## NPM Dependencies installieren (Frontend + Backend)
	@echo "Installing frontend dependencies..."
	npm install
	@echo "Installing backend dependencies..."
	cd server && npm install
	@echo "✓ Dependencies installiert"

# Docker Compose Commands
compose-up: ## Starte mit Docker Compose (Development)
	@echo "Starting application with Docker Compose..."
	docker-compose up -d
	@echo "✓ Application running at:"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:3001"

compose-down: ## Stoppe Docker Compose
	@echo "Stopping Docker Compose..."
	docker-compose down
	@echo "✓ Stopped"

compose-logs: ## Zeige Docker Compose Logs
	docker-compose logs -f

compose-restart: ## Neustarten mit Docker Compose
	docker-compose restart

compose-build: ## Rebuild Docker Compose Images
	docker-compose build

# Backend-spezifische Commands
backend-logs: ## Backend Logs anzeigen
	kubectl logs -l app=golf-handicap-backend -n $(NAMESPACE) --tail=100 -f

backend-shell: ## Shell im Backend Pod öffnen
	kubectl exec -it deployment/golf-handicap-backend -n $(NAMESPACE) -- sh

backend-port-forward: ## Port-Forward für Backend (Port 3001)
	@echo "Backend Port-Forward aktiv auf http://localhost:3001"
	kubectl port-forward svc/golf-handicap-backend 3001:3001 -n $(NAMESPACE)

# Database Commands
db-backup: ## Datenbank sichern
	@POD=$$(kubectl get pod -l app=golf-handicap-backend -n $(NAMESPACE) -o jsonpath='{.items[0].metadata.name}'); \
	BACKUP_FILE="backup-$$(date +%Y%m%d-%H%M%S).db"; \
	echo "Backing up database to $$BACKUP_FILE..."; \
	kubectl cp $(NAMESPACE)/$$POD:/app/data/golf-handicap.db ./$$BACKUP_FILE; \
	echo "✓ Backup saved to $$BACKUP_FILE"

db-restore: ## Datenbank wiederherstellen (nutze: make db-restore FILE=backup.db)
	@if [ -z "$(FILE)" ]; then \
		echo "Fehler: FILE nicht gesetzt. Beispiel: make db-restore FILE=backup.db"; \
		exit 1; \
	fi
	@POD=$$(kubectl get pod -l app=golf-handicap-backend -n $(NAMESPACE) -o jsonpath='{.items[0].metadata.name}'); \
	echo "Restoring database from $(FILE)..."; \
	kubectl cp $(FILE) $(NAMESPACE)/$$POD:/app/data/golf-handicap.db; \
	kubectl rollout restart deployment/golf-handicap-backend -n $(NAMESPACE); \
	echo "✓ Database restored and backend restarted"

# Storage Commands
pvc-status: ## PVC Status anzeigen
	kubectl get pvc -n $(NAMESPACE) golf-handicap-data
	kubectl describe pvc -n $(NAMESPACE) golf-handicap-data
