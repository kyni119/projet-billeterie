# Étape 1 : Construction de l'application React avec Node.js

# Utilise l’image légère node:18-alpine pour installer les dépendances et builder l'app
FROM node:18-alpine AS builder

# Définit le dossier de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json (si présent)
COPY package*.json ./

# Installe les dépendances du projet (React, Vite, etc.)
RUN npm install

# Copie tout le reste du code source de l'application
COPY . .

# Construit l'application React (génère le dossier /dist)
RUN npm run build


# Étape 2 : Servir l'application construite avec NGINX

# Utilise une image légère de NGINX pour servir les fichiers statiques
FROM nginx:alpine

# Copie les fichiers construits depuis l'étape précédente vers le dossier public de NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie une configuration personnalisée de NGINX
# Cela permet notamment de rediriger correctement les routes dans une SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose le port 80 (port par défaut de NGINX)
EXPOSE 80

# Commande pour lancer NGINX en mode non-détaché (premier plan)
CMD ["nginx", "-g", "daemon off;"]
