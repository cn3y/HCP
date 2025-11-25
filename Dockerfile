# Multi-Stage Build für optimierte Production-Images

# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiere Package-Dateien und installiere Dependencies
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Kopiere Source-Code und baue die Anwendung
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine

# Kopiere Custom Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiere gebaute Anwendung aus Build Stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponiere Port 80
EXPOSE 80

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Starte Nginx
CMD ["nginx", "-g", "daemon off;"]
