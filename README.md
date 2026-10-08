#  Projet Billetterie – Ticky

Ce projet est une **plateforme test de billetterie en ligne**, permettant aux utilisateurs de créer un compte, de consulter et réserver des événements, et aux organisateurs de gérer leurs événements, billets, et réservations.

Le projet est divisé en trois parties :

* **Frontend** (React + Vite)
* **Backend** (Node.js + Express)
* **Base de données** (MySQL)
* Le tout est **conteneurisé avec Docker**.

---

##  Fonctionnalités principales

### Pour les visiteurs :

* Navigation sur les événements publics
* Visualisation des détails d’un événement

### Pour les utilisateurs inscrits :

* Création de compte, connexion sécurisée
* Réservation de billets pour un événement
* Accès à leur tableau de bord et billets

### Pour les organisateurs :

* Création et gestion d’événements
* Téléversement de visuels de billets
* Accès à leur dashboard organisateur

---

##  Technologies utilisées

* **Frontend** : React 18 + Vite + Tailwind CSS
* **Backend** : Node.js, Express.js
* **Base de données** : MySQL
* **Conteneurisation** : Docker, Docker Compose
* **Outils** : Postman, VS Code, Docker Desktop

---

## Dockerisation complète

Le projet est dockerisé avec un seul fichier `docker-compose.yml` à la racine.

### Structure du projet

```
projet-billeterie/
├── docker-compose.yml
├── billeterie-backend/
│   ├── Dockerfile
│   └── src/
├── billet-frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
└── README.md
```

### Services lancés via Docker :

* `mysql` – Base de données
* `phpmyadmin` – Interface de gestion MySQL
* `backend` – API Express.js
* `frontend` – Application React servie par Nginx

---

##  Authentification

* Utilisation de tokens JWT
* Gestion des routes protégées pour les utilisateurs et les organisateurs
* Middleware d’autorisation côté backend

---

##  Développement & Démarches

* Méthodologie Agile avec sprints courts
* Backend développé en priorité (2 semaines) : routes REST, tests Postman, gestion des erreurs, sécurité
* Puis développement du frontend en composant les éléments de base (layouts, UI), pages publiques, puis pages privées et dashboard

###  Techniques utilisées :

* Lazy loading
* Composants modulaires et réutilisables
* Requêtes Axios, useEffect pour la synchro des données
* Upload de fichiers via Multer
**React 18**
- **Ant Design (antd)** & **MUI** (Material UI)
- **Axios** pour la communication API
- **React Table**, **React Select**, **Date-fns**

---

## Lancement du projet avec Docker

1. **Cloner le projet depuis GitHub :**

   ```bash
   git clone https://github.com/kyni119/projet-billeterie.git
   cd projet-billeterie
   ```

2. **S’assurer que Docker et Docker Compose sont bien installés.**

3. ** 📌 Lancer tous les services (MySQL, phpMyAdmin, backend, frontend) :**

```bash
docker-compose up --build
```


4. **Accéder aux différentes interfaces :**

   *  Frontend (site de billetterie) : [http://localhost:5173](http://localhost:5173)
   *  Backend API : [http://localhost:5000](http://localhost:5000)
   *  phpMyAdmin : [http://localhost:8080](http://localhost:8080)

     > Identifiants :
     >
     > * Utilisateur : `root`
     > * Mot de passe : `Franck123#`

5. **La base de données est automatiquement initialisée** grâce au fichier `billeterie_db.sql` monté dans le service MySQL.

---

## 📄 Licence

Projet personnel réalisé dans un cadre d'apprentissage. Toute contribution est la bienvenue !

---

