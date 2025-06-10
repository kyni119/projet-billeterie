const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('../src/routes/authRoutes');
const accountRoutes = require('../src/routes/accountRoutes');
const payRoutes = require('../src/routes/payroute');
const adminRoutes = require('../src/routes/adminRoute');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();


app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization','X-CSRF-Token'],
    credentials: true, 
  }));


// Servir les fichiers statiques
app.use('/public', express.static('public'));
app.use('/uploads', express.static('public/uploads'));  
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/account', accountRoutes);
app.use('/pay', payRoutes);
app.use('/admin', adminRoutes);
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('API Backend de la billeterie');
});
app.use((req, res) => {
    const errorResponse = {
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Not Found",
      message: "La route demandée n'existe pas.",
      path: req.originalUrl
    };
    res.status(404).json(errorResponse);
});
app.use((err, req, res, next) => {
    const errorResponse = {
      timestamp: new Date().toISOString(),
      status: 500,
      error: "Internal Server Error",
      message: err.message || "Quelque chose s'est mal passé.",
      path: req.originalUrl
    };
    res.status(500).json(errorResponse);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
