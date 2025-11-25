.PHONY: help build push deploy rollout logs scale clean test

# Variablen (überschreibbar mit Umgebungsvariablen)
REGISTRY ?= your-registry
IMAGE_NAME ?= golf-handicap-tracker
VERSION ?= latest
NAMESPACE ?= default

# Vollständiger Image-Name
IMAGE = $(REGISTRY)/$(IMAGE_NAME):$(VERSION)

help: ## Zeigt diese Hilfe an
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Docker Image bauen
	@echo "Building Docker image: $(IMAGE)"
	docker build -t $(IMAGE) .
	@echo "✓ Image erfolgreich gebaut: $(IMAGE)"

test-local: build ## Image lokal testen
	@echo "Starte lokalen Test auf Port 8080..."
	docker run --rm -p 8080:80 $(IMAGE)

push: ## Docker Image in Registry pushen
	@echo "Pushing image to registry: $(IMAGE)"
	docker push $(IMAGE)
	@echo "✓ Image erfolgreich gepusht: $(IMAGE)"

build-push: build push ## Build und Push in einem Schritt

deploy: ## In Kubernetes deployen
	@echo "Deploying to Kubernetes namespace: $(NAMESPACE)"
	kubectl apply -f k8s/ -n $(NAMESPACE)
	@echo "✓ Deployment erfolgreich"

deploy-kustomize: ## Deploy mit Kustomize
	@echo "Deploying with Kustomize to namespace: $(NAMESPACE)"
	kubectl apply -k k8s/ -n $(NAMESPACE)
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

install: ## NPM Dependencies installieren
	npm install
