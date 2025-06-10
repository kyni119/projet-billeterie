const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); 
const xss = require("xss");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const fs = require('fs');
const path = require('path'); 
const upload = require('../config/multerConfig');
router.use(cookieParser());
const dayjs = require('dayjs');



  
router.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
}));
const authenticateToken = async (req, res, next) => {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
  
    // 1. Aucun token présent
    if (!accessToken && !refreshToken) {
      return res.status(401).json({ 
        errorCode: 'AUTH_REQUIRED',
        message: 'Authentification requise' 
      });
    }
  
    // 2. Vérification du access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (e) {
        if (e.name !== 'TokenExpiredError') {
          return res.status(403).json({ 
            errorCode: 'INVALID_TOKEN',
            message: 'Token invalide' 
          });
        }
        // Si expiration, on continue pour tenter un rafraîchissement
      }
    }
  
    // 3. Tentative de rafraîchissement si refresh token disponible
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        
        // Générer nouveau access token
        const newAccessToken = jwt.sign(
          { id: decoded.id, role: decoded.role }, // Même payload que l'original
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
  
        // Set le nouveau cookie
        res.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000 // 1h
        });
  
        req.user = decoded;
        return next();
      } catch (e) {
        // Nettoyer les cookies invalides
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.status(401).json({ 
          errorCode: 'SESSION_EXPIRED',
          message: 'Session expirée' 
        });
      }
    }
  
    // 4. Cas où seul l'access token est présent mais expiré
    return res.status(401).json({ 
      errorCode: 'TOKEN_EXPIRED',
      message: 'Session expirée' 
    });
};

router.post('/update-password', [
    authenticateToken,  // Vérifie si l'utilisateur est authentifié
    body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis.'),
    body('newPassword')
      .notEmpty().withMessage('Le nouveau mot de passe est requis.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/)
      .withMessage('Le nouveau mot de passe doit contenir une majuscule, une minuscule, un caractère spécial, et faire au moins 8 caractères.')
  ], async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
  
    try {
      // Vérifier si l'utilisateur existe
      db.query('SELECT * FROM users WHERE id = ?', [req.user.id], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }
  
        const user = results[0];
  
        // Vérifier le mot de passe actuel
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
          return res.status(400).json({ message: 'Le mot de passe actuel est incorrect.' });
        }
  
        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
  
        // Mettre à jour le mot de passe dans la base de données
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id], (updateErr) => {
          if (updateErr) return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe.' });
  
          return res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
        });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur interne.' });
    }
  });
router.get('/getProfile', authenticateToken, (req, res) => {
    db.query('SELECT id, firstName, lastName, email, phoneNumber, profile, balance, totalSpent, numOrders FROM users WHERE id = ?', [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur.' });
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      } 
      const user = results[0];
      return res.status(200).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profile: user.profile,
        balance: user.balance,
        totalSpent: user.totalSpent,
        numOrders: user.numOrders,
      });
    });
});
router.post('/update-profile', [
    authenticateToken,  // Vérifie si l'utilisateur est authentifié
    body('firstName').notEmpty().withMessage('Le prénom est requis.'),
    body('lastName').notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('Email invalide.'),
    body('phoneNumber')
      .notEmpty().withMessage('Le numéro de téléphone est requis.')
      .isLength({ min: 5 }).withMessage('Le numéro de téléphone doit être valide.'),
  ], (req, res) => {
    const { firstName, lastName, email, phoneNumber} = req.body;
    const errors = validationResult(req);
  
    // Si des erreurs de validation existent, les retourner
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
  
    try {
      // Assainir les données pour éviter les injections XSS
      const sanitizedFirstName = xss(firstName);
      const sanitizedLastName = xss(lastName);
      const sanitizedEmail = xss(email);
      const sanitizedPhoneNumber = xss(phoneNumber);
  
      // Vérification si l'email ou le numéro de téléphone existent déjà pour un autre utilisateur
      db.query('SELECT * FROM users WHERE (email = ? OR phoneNumber = ?) AND id != ?', [sanitizedEmail, sanitizedPhoneNumber, req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });
  
        if (results.length > 0) {
          return res.status(400).json({ message: 'Email ou numéro de téléphone déjà utilisés.' });
        }
  
        // Mettre à jour les informations de l'utilisateur dans la base de données
        db.query('UPDATE users SET firstName = ?, lastName = ?, email = ?, phoneNumber = ? WHERE id = ?', 
          [sanitizedFirstName, sanitizedLastName, sanitizedEmail, sanitizedPhoneNumber, req.user.id], 
          (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
  
            return res.status(200).json({ message: 'Profil mis à jour avec succès.' });
          });
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      return res.status(500).json({ message: 'Erreur interne.' });
    }
});
router.post('/delete-account', authenticateToken, async (req, res) => {
    const userId = req.user.id; // récupéré grâce à authenticateToken
  
    try {
      // Supprimer l'utilisateur de la base de données
      db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
          console.error('Erreur lors de la suppression du compte :', err);
          return res.status(500).json({ message: 'Erreur lors de la suppression du compte.' });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }
  
        // Supprimer les cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
  
        return res.status(200).json({ message: 'Compte supprimé avec succès.' });
      });
    } catch (error) {
      console.error('Erreur serveur :', error);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
});
router.post('/create-event', authenticateToken, [
  // Validation des champs nécessaires
  body('title').trim().notEmpty().withMessage('Le titre est requis'),
  body('description').optional().isString().isLength({ max: 65000 }).withMessage('La description ne doit pas dépasser 65 000 caractères'),
  body('category_id').isInt().withMessage('ID de catégorie invalide'),
  body('location_type').isIn(['online', 'offline']),
  body('address').if(body('location_type').equals('offline')).notEmpty(),
  body('city').if(body('location_type').equals('offline')).notEmpty(),
  body('phone').notEmpty().isLength({ min: 4 }).withMessage('Le contact doit être valide.'),
  body('is_recurring').isBoolean().withMessage('Doit être vrai ou faux'),
  body('start_date').if(body('is_recurring').equals(false)).notEmpty().isISO8601().withMessage('Date de début requise'),
  body('end_date').if(body('is_recurring').equals(false)).notEmpty().isISO8601().custom((endDate, { req }) => endDate > req.body.start_date).withMessage('La date de fin doit être après la date de début'),
  body('website_url').optional().isURL(),
  body('facebook_url').optional().isURL().withMessage('L\'URL de Facebook doit être valide.'),
  body('whatsapp_url').optional().isURL().withMessage('L\'URL de WhatsApp doit être valide.'),
  body('instagram_url').optional().isURL().withMessage('L\'URL d\'Instagram doit être valide.'),
  body('twitter_url').optional().isURL().withMessage('L\'URL de Twitter doit être valide.'),
  
  // Cas récurrent (optionnel)
  body('dates').if(body('is_recurring').equals(true)).isArray({ min: 1 }).withMessage('Au moins une date requise'),
], (req, res) => {
  // 1. Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }

  // 2. Vérification du rôle
  if (req.user.role !== 1) {
    return res.status(403).json({ message: "Réservé aux organisateurs" });
  }

  const { is_recurring, dates, start_date, end_date, ...eventData } = req.body;


  const parseSQLDate = (isoDateStr) => {
  return new Date(isoDateStr).toISOString().slice(0, 19).replace('T', ' ');
};


  db.query(
    'INSERT INTO events SET ?',
    {
      ...eventData,
      is_recurring,
      start_date: is_recurring ? null : parseSQLDate(start_date),
      end_date: is_recurring ? null : parseSQLDate(end_date),
      start_date: is_recurring ? null : start_date,
      end_date: is_recurring ? null : end_date,
      organizer_id: req.user.id,
      status: 0,
      created_at: new Date()
    },
    (err, eventResult) => {
      if (err) {
        console.error('Erreur MySQL:', err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      // Si l'événement est récurrent, insertion des dates supplémentaires
      if (is_recurring && dates) {
        db.query(
          'INSERT INTO event_dates (event_id, date, start_time, end_time) VALUES ?',
          [dates.map(d => [eventResult.insertId, d.date, d.start_time, d.end_time])],
          (err) => {
            if (err) {
              console.error('Erreur dates:', err);
              return res.status(500).json({ message: "Erreur lors de l'ajout des dates" });
            }
            res.status(201).json({ success: true, eventId: eventResult.insertId });
          }
        );
      } else {
        res.status(201).json({ success: true, eventId: eventResult.insertId });
      }
    }
  );
});


// my event piur les organsiateurs 
router.get('/my-events', authenticateToken, (req, res) => {
  const organizerId = req.user.id;

   // 2. Vérification du rôle
  if (req.user.role !== 1) {
    return res.status(403).json({ message: "Réservé aux organisateurs" });
  }

  const query = `
    SELECT id, title, description, image_url , start_date, end_date, is_recurring, status, created_at
    FROM events
    WHERE organizer_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [organizerId], (err, results) => {
    if (err) {
      console.error("Erreur MySQL:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    res.status(200).json({ events: results });
  });
});

router.post('/add-image/:eventId', authenticateToken, upload.single('image'), (req, res) => {
  const eventId = req.params.eventId;  // Récupérer l'ID de l'événement
  const imagePath = req.file ? '/uploads/' + req.file.filename : null;  // Chemin de l'image

  if (!imagePath) {
    return res.status(400).json({ message: 'Aucune image fournie' });
  }

  // Mettre à jour l'événement avec l'URL de l'image
  db.query(
    'UPDATE events SET image_url = ? WHERE id = ?',
    [imagePath, eventId],
    (err, result) => {
      if (err) {
        console.error('Erreur MySQL:', err);
        return res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'image' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Événement non trouvé' });
      }

      res.status(200).json({ success: true, eventId: eventId, imageUrl: imagePath });
    }
  );
});
router.patch('/events/:id/updateStatus', authenticateToken, [
  body('status').isIn([-2, -1, 0, 1]).withMessage('Statut invalide')
], (req, res) => {
  // 1. Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }

  // 2. Vérification du rôle
  if (req.user.role !== 1) {
    return res.status(403).json({ message: "Réservé aux organisateurs" });
  }

  // 3. Mise à jour du statut
  db.query(
    'UPDATE events SET status = ? WHERE id = ? AND organizer_id = ?',
    [req.body.status, req.params.id, req.user.id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Événement non trouvé ou non autorisé" });
      }

      res.json({ 
        success: true,
        newStatus: req.body.status
      });
    }
  );
});

router.get('/getUpcomingEvents', (req, res) => {
  const today = dayjs().format('YYYY-MM-DD');

  const query = `
    SELECT 
      e.id,
      e.title,
      e.description,
      e.category_id,
      e.location_type,
      e.address,
      e.city,
      e.image_url,
      e.phone,
      e.website_url,
      e.facebook_url,
      e.whatsapp_url,
      e.instagram_url,
      e.twitter_url,
      e.organizer_id,
      e.is_recurring,
      e.status,
      IF(e.is_recurring = 0, e.start_date, NULL) AS start_date,
      IF(e.is_recurring = 0, e.end_date, NULL) AS end_date,
      IF(e.is_recurring = 1,
        (SELECT JSON_ARRAYAGG(
           JSON_OBJECT(
             'date', ed.date,
             'start_time', ed.start_time,
             'end_time', ed.end_time
           )
         ) FROM event_dates ed WHERE ed.event_id = e.id),
        NULL
      ) AS dates,
      (SELECT JSON_ARRAYAGG(
         JSON_OBJECT(
           'id', t.id,
           'type', t.ticket_type,
           'price', t.price,
           'available', t.available_tickets,
           'advantages', t.advantages
         )
       ) FROM tickets t WHERE t.event_id = e.id) AS tickets
    FROM events e
    WHERE 
      (
        e.is_recurring = 0 AND e.end_date >= ?
      ) OR (
        e.is_recurring = 1 AND EXISTS (
          SELECT 1 FROM event_dates ed WHERE ed.event_id = e.id AND ed.date >= ?
        )
      )
    ORDER BY e.created_at DESC
  `;

  db.query(query, [today, today], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    const events = results.map(event => ({
      ...event,
      dates: typeof event.dates === 'string' ? JSON.parse(event.dates) : event.dates,
      tickets: typeof event.tickets === 'string' ? JSON.parse(event.tickets) : event.tickets
    }));

    res.json(events);
  });
});


router.get('/getEvents', (req, res) => {
  const query = `
    SELECT 
      e.id,
      e.title,
      e.description,
       e.category_id,
      e.location_type,
      e.address,
      e.city,
      e.image_url,
      e.phone,
      e.website_url,
      e.facebook_url,
      e.whatsapp_url,
      e.instagram_url,
      e.twitter_url,
      e.organizer_id,
      e.is_recurring,
      e.status,
      IF(e.is_recurring = 1, NULL, e.start_date) AS start_date,
      IF(e.is_recurring = 1, NULL, e.end_date) AS end_date,
      IF(e.is_recurring = 1,
        (SELECT JSON_ARRAYAGG(
           JSON_OBJECT(
             'date', ed.date,
             'start_time', ed.start_time,
             'end_time', ed.end_time
           )
         ) FROM event_dates ed WHERE ed.event_id = e.id),
        NULL
      ) AS dates,
      (SELECT JSON_ARRAYAGG(
         JSON_OBJECT(
           'id', t.id,
           'type', t.ticket_type,
           'price', t.price,
           'available', t.available_tickets,
           'advantages', t.advantages
         )
       ) FROM tickets t WHERE t.event_id = e.id) AS tickets
    FROM events e
    ORDER BY e.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    const events = results.map(event => ({
      ...event,
      dates: typeof event.dates === 'string' ? JSON.parse(event.dates) : event.dates,
      tickets: typeof event.tickets === 'string' ? JSON.parse(event.tickets) : event.tickets
    }));

    res.json(events);
  });
});
router.get('/getEvents/:id', (req, res) => {
  const query = `
    SELECT 
      e.id,
      e.title,
      e.description,
      e.category_id,
      e.location_type,
      e.address,
      e.city,
      e.image_url,
      e.phone,
      e.website_url,
      e.facebook_url,
      e.whatsapp_url,
      e.instagram_url,
      e.twitter_url,
      e.organizer_id,
      e.is_recurring,
      e.status,
      IF(e.is_recurring = 1, NULL, e.start_date) AS start_date,
      IF(e.is_recurring = 1, NULL, e.end_date) AS end_date,
      IF(e.is_recurring = 1,
        (SELECT JSON_ARRAYAGG(
           JSON_OBJECT(
             'date', ed.date,
             'start_time', ed.start_time,
             'end_time', ed.end_time
           )
         ) FROM event_dates ed WHERE ed.event_id = e.id),
        NULL
      ) AS dates,
      (SELECT JSON_ARRAYAGG(
         JSON_OBJECT(
           'id', t.id,
           'type', t.ticket_type,
           'price', t.price,
           'available', t.available_tickets,
           'advantages', t.advantages
         )
       ) FROM tickets t WHERE t.event_id = e.id) AS tickets
    FROM events e
    WHERE e.id = ?
  `;

  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (results.length === 0) return res.status(404).json({ message: "Événement non trouvé" });

    const event = {
      ...results[0],
      dates: typeof results[0].dates === 'string' ? JSON.parse(results[0].dates) : results[0].dates,
      tickets: typeof results[0].tickets === 'string' ? JSON.parse(results[0].tickets) : results[0].tickets
    };

    res.json(event);
  });
});
router.get('/events/search', (req, res) => {
  const {
    category_id,
    start_date,
    end_date,
    time_frame, // today, week, month, weekend
    price_sort, // asc, desc
    location_type,
    city,
    search_query,
    min_price,
    max_price,
    organizer_name
  } = req.query;

  let query = `
    SELECT 
      e.*,
      u.firstName AS organizer_firstName,
      u.lastName AS organizer_lastName,
      IF(e.is_recurring = 1,
        (SELECT JSON_ARRAYAGG(
           JSON_OBJECT(
             'date', ed.date,
             'start_time', ed.start_time,
             'end_time', ed.end_time
           )
         ) FROM event_dates ed WHERE ed.event_id = e.id),
        NULL
      ) AS dates,
      (SELECT JSON_ARRAYAGG(
         JSON_OBJECT(
           'type', t.ticket_type,
           'price', t.price,
           'available', t.available_tickets
         )
       ) FROM tickets t WHERE t.event_id = e.id) AS tickets,
      (SELECT MIN(price) FROM tickets WHERE event_id = e.id) AS min_price,
      (SELECT MAX(price) FROM tickets WHERE event_id = e.id) AS max_price
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    WHERE 1=1
  `;

  const params = [];

  // Filtres de base
  if (category_id && category_id !== '-1') {
  query += ' AND e.category_id = ?';
  params.push(category_id);
}


  if (location_type) {
    query += ' AND e.location_type = ?';
    params.push(location_type);
  }

  if (city) {
    query += ' AND e.city LIKE ?';
    params.push(`%${city}%`);
  }


  if (search_query) {
  query += 'AND ( e.title LIKE ? OR e.description LIKE ? OR e.address LIKE ? OR e.city LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ?)';
  params.push(
    `%${search_query}%`,
    `%${search_query}%`,
    `%${search_query}%`,
    `%${search_query}%`,
    `%${search_query}%`,
    `%${search_query}%`
  );
}


  // Filtre par nom organisateur
  if (organizer_name) {
    query += ' AND (u.firstName LIKE ? OR u.lastName LIKE ?)';
    params.push(`%${organizer_name}%`, `%${organizer_name}%`);
  }

  // Filtre par prix
  if (min_price) {
    query += ' AND (SELECT MIN(price) FROM tickets WHERE event_id = e.id) >= ?';
    params.push(min_price);
  }
  if (max_price) {
    query += ' AND (SELECT MIN(price) FROM tickets WHERE event_id = e.id) <= ?';
    params.push(max_price);
  }

  // Gestion des dates (version améliorée)
  if (time_frame) {
  
    const now = new Date();
    let startDate, endDate;

    switch (time_frame) {
      case 'today':
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      startDate = start.toISOString().slice(0, 19).replace('T', ' ');

      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      endDate = end.toISOString().slice(0, 19).replace('T', ' ');
      break;

      case 'weekend':
        const saturday = new Date(now);
saturday.setDate(now.getDate() + ((6 - now.getDay()) % 7));
saturday.setHours(0, 0, 0, 0);

const sundayy = new Date(saturday);
sundayy.setDate(saturday.getDate() + 1);
sundayy.setHours(23, 59, 59, 999);

startDate = saturday.toISOString().slice(0, 19).replace('T', ' ');
endDate = sundayy.toISOString().slice(0, 19).replace('T', ' ');

        break;
      case 'week':
        const monday = new Date(now);
monday.setDate(now.getDate() - now.getDay() + 1); // Lundi
monday.setHours(0, 0, 0, 0);

const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6); // Dimanche
sunday.setHours(23, 59, 59, 999);

startDate = monday.toISOString().slice(0, 19).replace('T', ' ');
endDate = sunday.toISOString().slice(0, 19).replace('T', ' ');

        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 19).replace('T', ' ');
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 19).replace('T', ' ');
        break;
    }

    // Après avoir calculé startDate et endDate
    query += `
      AND (
        (e.is_recurring = 0 AND (
          (e.start_date BETWEEN ? AND ?) OR
          (e.end_date BETWEEN ? AND ?) OR
          (e.start_date <= ? AND e.end_date >= ?)
        ))
        OR
        (e.is_recurring = 1 AND EXISTS (
          SELECT 1 FROM event_dates ed 
          WHERE ed.event_id = e.id 
          AND DATE(ed.date) BETWEEN DATE(?) AND DATE(?)
        ))
      )
    `;
    params.push(startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate);

  } else if (start_date && end_date) {
    // Formatage des dates d'entrée (supporte plusieurs formats)
    const formattedStart = new Date(start_date).toISOString().slice(0, 19).replace('T', ' ');
    const formattedEnd = new Date(end_date).toISOString().slice(0, 19).replace('T', ' ');

    query += `
      AND (
        (e.is_recurring = 0 AND (
          (e.start_date BETWEEN ? AND ?) OR
          (e.end_date BETWEEN ? AND ?) OR
          (e.start_date <= ? AND e.end_date >= ?)
        ))
        OR
        (e.is_recurring = 1 AND EXISTS (
          SELECT 1 FROM event_dates ed 
          WHERE ed.event_id = e.id 
          AND ed.date BETWEEN DATE(?) AND DATE(?)
        ))
      )
    `;
    params.push(
      formattedStart, formattedEnd,
      formattedStart, formattedEnd,
      formattedStart, formattedEnd,
      formattedStart, formattedEnd
    );
  }

  // Tri
  if (price_sort === 'asc' || price_sort === 'desc') {
    query += ` ORDER BY min_price ${price_sort === 'asc' ? 'ASC' : 'DESC'}`;
  } else {
    query += ' ORDER BY e.created_at DESC';
  }

  // Pagination
  query += ' LIMIT 50';

  db.query(query, params, (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur", error: err.message });
      
    }

    const events = results.map(event => ({
      ...event,
      organizer: {
        firstName: event.organizer_firstName,
        lastName: event.organizer_lastName
      },
      dates: safeParse(event.dates),
      tickets: safeParse(event.tickets),
      min_price: event.min_price,
      max_price: event.max_price
    }));

    res.json(events);
  });
});

function safeParse(jsonString) {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch {
    return null;
  }
}

// POST ajouter des ticket auevents 
router.post('/:eventId/tickets', authenticateToken, [
  body('ticket_type').isIn(['VVIP', 'VIP', 'Grand Public']).withMessage('Type invalide'),
  body('price').isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('available_tickets').isInt({ min: 1 }).withMessage('Quantité invalide'),
  body('advantages').optional().isString()
], (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }

  // Vérifier que l'événement appartient à l'organisateur
  db.query(
    'SELECT organizer_id FROM events WHERE id = ?',
    [req.params.eventId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0 || results[0].organizer_id !== req.user.id) {
        return res.status(403).json({ message: "Action non autorisée" });
      }

      // Créer le ticket
      db.query(
        'INSERT INTO tickets SET ?',
        {
          event_id: req.params.eventId,
          ticket_type: req.body.ticket_type,
          price: req.body.price,
          available_tickets: req.body.available_tickets,
          advantages: req.body.advantages || null
        },
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur lors de la création du ticket" });
          }
          res.status(201).json({ 
            success: true,
            ticketId: result.insertId 
          });
        }
      );
    }
  );
});
  
// POST /api/events/:eventId/payment-methods
router.post('/:eventId/payment-methods', authenticateToken, [
  // Validation globale
  body('payment_type')
    .notEmpty().withMessage('Le type de paiement est requis')
    .isIn(['visa', 'moov', 'orange', 'mtn', 'mastercard', 'wave', 'djamo'])
    .withMessage('Type de paiement invalide'),

  // Validation conditionnelle
  body('rib')
    .optional()
    .isString().withMessage('Le RIB doit être une chaîne de caractères'),

  body('first_name')
    .notEmpty().withMessage('Le prénom  est requis')
    .isString(),

  body('last_name')
    .notEmpty().withMessage('Le nom est requis')
    .isString(),

  body('phone_number')
    .if(body('payment_type').isIn(['moov', 'orange', 'mtn', 'wave', 'djamo']))
    .notEmpty().withMessage('Le numéro de téléphone est requis pour recevoir votre recette de paiement')
    .isLength({ min: 4 }).withMessage('Numéro de téléphone invalide'),

  body('email')
    .optional()
    .isEmail().withMessage('Email invalide'),

  body('billing_address')
    .optional()
    .isString(),

  body('billing_city')
    .optional()
    .isString(),

  body('id_card_number')
    .if(body('payment_type').isIn(['visa', 'mastercard']))
    .notEmpty().withMessage('Le numéro de carte est requis')
    .isString()
], (req, res) => {
  // 1. Vérification des erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }
  // 2. Vérification des droits
db.query(
  'SELECT organizer_id FROM events WHERE id = ?',
  [req.params.eventId],
  (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (results.length === 0 || results[0].organizer_id !== req.user.id) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    // 3. Préparation des données
    const { 
      payment_type,
      rib,
      first_name,
      last_name,
      phone_number,
      email,
      billing_address,
      billing_city,
      id_card_number
    } = req.body;

    const paymentData = {
      event_id: req.params.eventId,
      payment_type,
      first_name,
      last_name,
      ...(rib && { rib }),
      ...(phone_number && { phone_number }),
      ...(email && { email }),
      ...(billing_address && { billing_address }),
      ...(billing_city && { billing_city }),
      ...(id_card_number && { id_card_number })
    };

    // 4. Vérifier si une méthode existe déjà pour cet event_id
    db.query(
      'SELECT id FROM payment_methods WHERE event_id = ?',
      [req.params.eventId],
      (err, existingMethods) => {
        if (err) {
          return res.status(500).json({ message: "Erreur serveur" });
        }

        if (existingMethods.length > 0) {
          // 5a. Mise à jour si existe déjà
          db.query(
            'UPDATE payment_methods SET ? WHERE event_id = ?',
            [paymentData, req.params.eventId],
            (err, result) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur lors de la mise à jour" });
              }
              res.json({ 
                success: true,
                message: "Méthode de paiement mise à jour",
                methodId: existingMethods[0].id
              });
            }
          );
        } else {
          // 5b. Insertion si n'existe pas
          db.query(
            'INSERT INTO payment_methods SET ?',
            paymentData,
            (err, result) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur lors de l'ajout" });
              }
              res.status(201).json({ 
                success: true,
                message: "Méthode de paiement créée",
                methodId: result.insertId 
              });
            }
          );
        }
      }
    );
  }
);
});

//mettre en favoris 
router.post('/putFavorite', authenticateToken, [
  body('event_id').isInt().withMessage('ID événement invalide')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: errors.array()[0].msg // Retourne seulement le 1er message
    });
  }

  const { event_id } = req.body;
  const user_id = req.user.id;

  // Vérifie si l'événement existe
  db.query('SELECT id FROM events WHERE id = ?', [event_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    // Check si déjà en favori
    db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND event_id = ?',
      [user_id, event_id],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });

        if (results.length > 0) {
          // Supprime le favori
          db.query(
            'DELETE FROM favorites WHERE user_id = ? AND event_id = ?',
            [user_id, event_id],
            (err) => {
              if (err) return res.status(500).json({ message: "Erreur lors de la suppression" });
              res.json({ success: true, isFavorite: false });
            }
          );
        } else {
          // Ajoute en favori
          db.query(
            'INSERT INTO favorites (user_id, event_id) VALUES (?, ?)',
            [user_id, event_id],
            (err) => {
              if (err) return res.status(500).json({ message: "Erreur lors de l'ajout" });
              res.status(201).json({ success: true, isFavorite: true });
            }
          );
        }
      }
    );
  });
});

router.get('/getFavorites', authenticateToken, (req, res) => {
  db.query(`
    SELECT e.* FROM events e
    JOIN favorites f ON e.id = f.event_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `, [req.user.id], (err, events) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    // Si aucun favori
    if (!events || events.length === 0) return res.json([]);

    // Préparer un compteur pour savoir quand on a fini
    let completed = 0;
    const result = [];

    events.forEach((event, index) => {
      if (event.is_recurring) {
        db.query(
          `SELECT date, start_time, end_time 
           FROM event_dates 
           WHERE event_id = ?
           ORDER BY date ASC, start_time ASC`,
          [event.id],
          (dateErr, dates) => {
            if (dateErr) return res.status(500).json({ message: "Erreur récupération des dates" });

            event.dates = dates;
            result[index] = event;

            completed++;
            if (completed === events.length) {
              res.json(result);
            }
          }
        );
      } else {
        event.dates = null;
        result[index] = event;

        completed++;
        if (completed === events.length) {
          res.json(result);
        }
      }
    });
  });
});

// GET /getReservations
router.get('/getReservations', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des réservations:', err);
        return res.status(500).json({ message: 'Erreur serveur.' });
      }

      res.status(200).json(results); // on renvoie juste la liste brute
    }
  );
});

// GET /getReservation/:id
router.get('/getReservations/:id', authenticateToken, (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user.id;

  db.query(
    `SELECT * FROM reservations WHERE id = ? AND user_id = ?`,
    [reservationId, userId],
    (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération de la réservation:', err);
        return res.status(500).json({ message: 'Erreur serveur.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Réservation non trouvée.' });
      }

      res.status(200).json(results[0]); // un seul objet
    }
  );
});



module.exports = router;


module.exports = router;




