# Utilise une image Node.js officielle comme base (version 18 LTS)
FROM node:18

# Définit le répertoire de travail à l’intérieur du conteneur
WORKDIR /app

# Copie les fichiers de dépendances package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances du backend
RUN npm install

# Copie le reste des fichiers de l'application (routes, contrôleurs, etc.)
COPY . .

# Expose le port 5000 (le même que celui utilisé dans Express)
EXPOSE 5000

# Démarre le serveur en lançant le fichier principal
CMD ["node", "src/server.js"]
