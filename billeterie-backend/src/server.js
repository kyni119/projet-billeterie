const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const payRoutes = require('./routes/payroute');
const adminRoutes = require('./routes/adminRoute');

// Le serveur ne doit pas démarrer sans secret JWT
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET est requis. Voir .env.example');
  process.exit(1);
}

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const frontendOrigin = (process.env.FRONTEND_URL || '').replace(/\/+$/, '');

// Derrière un reverse proxy (nginx, Render...), nécessaire pour avoir la vraie IP (rate limit)
app.set('trust proxy', 1);

app.use(helmet({
  // Les images uploadées sont affichées par le frontend (autre origine)
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: frontendOrigin || false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Protection CSRF : les requêtes qui modifient des données doivent venir de l'origine du frontend
// (en complément de cookies sameSite=strict).
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && frontendOrigin && origin !== frontendOrigin) {
    return res.status(403).json({ message: 'Origine non autorisée' });
  }
  next();
});

// Fichiers statiques : uniquement les images uploadées (pas tout le dossier public)
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.get('/', (req, res) => {
  res.send('API Backend de la billeterie');
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/account', accountRoutes);
app.use('/pay', payRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    timestamp: new Date().toISOString(),
    status: 404,
    error: 'Not Found',
    message: "La route demandée n'existe pas.",
    path: req.originalUrl,
  });
});

// Gestionnaire d'erreurs : ne jamais exposer les détails internes en production
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    error: status >= 500 ? 'Internal Server Error' : 'Bad Request',
    message: status >= 500 && isProd ? "Quelque chose s'est mal passé." : err.message,
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app;
