FROM node:20-alpine

WORKDIR /app

# Kopiere package files
COPY package*.json ./

# Installiere dependencies
RUN npm ci --only=production

# Kopiere source code
COPY src/ ./src/

# Erstelle data-Verzeichnis
RUN mkdir -p /app/data

# Exponiere Port
EXPOSE 3001

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Starte Server
CMD ["node", "src/index.js"]
