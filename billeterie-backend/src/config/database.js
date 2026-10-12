const mysql = require('mysql2');
require('dotenv').config();

// Pool de connexions : une connexion par requête (et par transaction),
// reconnexion automatique en cas de coupure.
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Erreur de connexion MySQL:', err.message);
  } else {
    console.log('Connecté à MySQL');
    connection.release();
  }
});

module.exports = db;
