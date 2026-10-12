FROM node:20-slim

WORKDIR /app

COPY package*.json ./
# Dépendances de production uniquement, installation reproductible
RUN npm ci --omit=dev

COPY . .

# Dossier des images uploadées, exécution sans droits root
RUN mkdir -p public/uploads && chown -R node:node /app
USER node

EXPOSE 5000
CMD ["node", "src/server.js"]
