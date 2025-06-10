const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); 
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const generateTicketPDF = require('../models/reservationPdf');
const path = require('path');


// Configuration Stripe
const nodemailer = require('nodemailer');
router.use(cookieParser());
router.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
}));

function formatDate(dateString) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
  
    const date = new Date(dateString);
  
    // Vérifie si la date est valide
    if (isNaN(date.getTime())) {
      throw new Error('Date invalide');
    }
  
    // Formater la date selon les options définies
    return date.toLocaleDateString('fr-FR', options);
  }
 
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      timeZone: 'Africa/Abidjan', // ou 'Europe/Paris' selon ton besoin
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
// Fonction de calcul du prix total (version corrigée)
function calculateTotal(tickets, callback) {
  let total = 0;
  let processed = 0;

  if (tickets.length === 0) return callback(null, 0);

  tickets.forEach(item => {
    db.query(
      'SELECT price FROM tickets WHERE id = ?',
      [item.ticket_id],
      (err, [ticket]) => {
        if (err) return callback(err);
        if (!ticket) return callback(new Error(`Ticket ${item.ticket_id} introuvable`));
        
        total += item.quantity * ticket.price;
        processed++;
        
        if (processed === tickets.length) {
          callback(null, total);
        }
      }
    );
  });
}

// Fonction d'authentification du token
function authenticateToken(req, res, next) {
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
        { id: decoded.id, role: decoded.role },
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
}

// Fonction de vérification de la disponibilité des tickets
function checkTicketsAvailability(event_id, tickets, callback) {
  let availabilityCheck = { available: true, message: '' };
  let processed = 0;

  if (tickets.length === 0) {
    return callback(null, { available: false, message: 'Aucun ticket spécifié' });
  }

  tickets.forEach(ticket => {
    db.query(
      `SELECT available_tickets FROM tickets WHERE event_id = ? AND id = ?`,
      [event_id, ticket.ticket_id],
      (err, ticketInfo) => {
        if (err) return callback(err);
        
        if (!ticketInfo || ticketInfo.length === 0) {
          availabilityCheck.available = false;
          availabilityCheck.message = `Ticket avec l'ID ${ticket.ticket_id} non trouvé pour cet événement.`;
        } else if (ticket.quantity > ticketInfo[0].available_tickets) {
          availabilityCheck.available = false;
          availabilityCheck.message = `Il n'y a pas assez de tickets pour le type ${ticket.ticket_id}. Tickets disponibles: ${ticketInfo[0].available_tickets}.`;
        }

        processed++;
        if (processed === tickets.length) {
          callback(null, availabilityCheck);
        }
      }
    );
  });
}
// Mise à jour des stocks (version transactionnelle)
function updateTicketsStock(tickets, callback) {
  db.query('START TRANSACTION', (startErr) => {
    if (startErr) return callback(startErr);

    let processed = 0;
    let hasError = false;

    tickets.forEach(item => {
      db.query(
        `UPDATE tickets SET 
         available_tickets = available_tickets - ? 
         WHERE id = ? AND available_tickets >= ?`,
        [item.quantity, item.ticket_id, item.quantity],
        (err, result) => {
          if (err || result.affectedRows === 0) {
            hasError = true;
            return db.query('ROLLBACK', () => {
              callback(err || new Error(`Stock insuffisant pour le ticket ${item.ticket_id}`));
            });
          }

          processed++;
          if (processed === tickets.length && !hasError) {
            db.query('COMMIT', (commitErr) => {
              if (commitErr) return callback(commitErr);
              callback(null);
            });
          }
        }
      );
    });
  });
}
function getReservationDetails(reservationId, userId, callback) {
  // 1. Récupérer les informations de l'utilisateur
  db.query(
    `SELECT * FROM users WHERE id = ?`,
    [userId],
    (userErr, [user]) => {
      if (userErr) return callback(userErr);
      if (!user) return callback(new Error(`Utilisateur avec ID ${userId} non trouvé.`));

      // 2. Récupérer les informations de la réservation
      db.query(
        `SELECT * FROM reservations WHERE id = ? AND user_id = ?`,
        [reservationId, userId],
        (reservErr, [reservation]) => {
          if (reservErr) return callback(reservErr);
          if (!reservation) return callback(new Error(`Réservation avec ID ${reservationId} non trouvée pour cet utilisateur.`));

          // 3. Récupérer les informations de l'événement
          db.query(
            `SELECT * FROM events WHERE id = ?`,
            [reservation.event_id],
            (eventErr, [event]) => {
              if (eventErr) return callback(eventErr);
              if (!event) return callback(new Error(`Événement avec ID ${reservation.event_id} non trouvé.`));

              // Si événement récurrent, on récupère aussi les dates multiples
              if (event.is_recurring) {
                db.query(
                  `SELECT * FROM event_dates WHERE event_id = ? ORDER BY date ASC, start_time ASC`,
                  [event.id],
                  (datesErr, dates) => {
                    if (datesErr) return callback(datesErr);
                    event.dates = dates; // on les ajoute à l'objet event
                    callback(null, { user, reservation, event });
                  }
                );
              } else {
                callback(null, { user, reservation, event });
              }
            }
          );

        }
      );
    }
  );
}

async function sendConfirmationEmail(userId, reservationId, callback) {
  try {
    // 1. Récupération de la réservation
    const reservation = await new Promise((resolve, reject) => {
      getFullReservation(reservationId, (err, res) => err ? reject(err) : resolve(res));
    });

    if (reservation.user_id !== userId) {
      return callback(new Error("Accès non autorisé à cette réservation."));
    }

    // 2. Configuration de l'email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // 3. Génération du PDF en mémoire
    const pdfBuffer = await generateTicketPDF(reservation);

    // 4. Envoi de l'email avec pièce jointe
    const mailOptions = {
      to: reservation.email,
      subject: `🎟 Votre billet pour ${reservation.title}`,
       html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre billet Ticky</title>
    <style>
        body { font-family: 'Google Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; color: #202124; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4285F4 0%, #34A853 100%); padding: 32px; text-align: center; color: white; }
        .content { padding: 24px 32px; }
        .ticket { background: #f8f9fa; border-left: 4px solid #4285F4; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0; }
        .footer { padding: 16px; text-align: center; font-size: 12px; color: #5f6368; background: #f8f9fa; }
        h1 { margin: 0; font-size: 24px; font-weight: 500; }
        h2 { margin: 16px 0; font-size: 18px; font-weight: 500; color: #3c4043; }
        p { margin: 8px 0; line-height: 1.5; }
        ul { margin: 8px 0; padding-left: 24px; }
        li { margin-bottom: 8px; }
        .highlight { color: #4285F4; font-weight: 500; }
        .button { display: inline-block; padding: 12px 24px; background: #4285F4; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; margin: 16px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TICKY</h1>
            <p>Confirmation de votre réservation</p>
        </div>
        
        <div class="content">
            <p>Bonjour <span class="highlight">${reservation.firstName ?? ''} ${reservation.lastName ?? ''}</span>,</p>
            <p>Votre réservation pour <span class="highlight">${reservation.title}</span> a bien été enregistrée. Voici un récapitulatif :</p>
            
            <div class="ticket">
                <h2>🎟 Détails de votre billet</h2>
                <p><strong>Référence :</strong> ${reservation.id}</p>
                <p><strong>Événement :</strong> ${reservation.title}</p>
                <p><strong>Lieu :</strong> ${reservation.location_type === 'online' ? 'Événement en ligne' : reservation.address}</p>
                
                <p><strong>Date(s) :</strong></p>
                <ul>
                    ${reservation.dates
                      ? reservation.dates.map(d => `<li>${d.date} de ${d.start_time} à ${d.end_time}</li>`).join('')
                      : `<li>${reservation.start_date ?? ''} → ${reservation.end_date ?? ''}</li>`}
                </ul>
                
                <p><strong>Billets :</strong></p>
                <ul>
                    ${reservation.tickets?.map(ticket => 
                      `<li>${ticket.quantity} x ${ticket.ticket_type}${ticket.advantages ? ` (${ticket.advantages})` : ''}</li>`
                    ).join('') || '<li>Aucun billet trouvé</li>'}
                </ul>
                
                <p><strong>Total payé :</strong> ${reservation.total_amount} FCFA</p>
            </div>
            
            <p>Votre billet PDF est attaché à cet email. Présentez-le à l'entrée de l'événement.</p>
            
            <p>Pour toute question, contactez notre <a href="mailto:support@ticky.com" style="color: #4285F4;">équipe support</a>.</p>
            
            <p>À très bientôt,</p>
            <p><strong>L'équipe Ticky</strong> 🎉</p>
        </div>
        
        <div class="footer">
            <p>Ticky - Plateforme de billetterie en ligne</p>
            <p>© ${new Date().getFullYear()} Ticky. Tous droits réservés.</p>
            <p><a href="https://ticky.com" style="color: #4285F4;">Visitez notre site</a></p>
        </div>
    </div>
</body>
</html>
          `,
      attachments: [{
        filename: `Ticky_Billet_${reservationId}.pdf`,
        content: pdfBuffer
      }]
    };

    await transporter.sendMail(mailOptions);


     // Archivage optionnel
    const archiveDir = path.join(__dirname, 'tickets_archives');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    fs.writeFileSync(path.join(archiveDir, `ticket_${reservationId}.pdf`), pdfBuffer);



    callback(null);
  } catch (err) {
    callback(err);
  }
}





function getFullReservation(reservationId, callback) {
  db.query(
    `SELECT r.*, 
     u.firstName, u.lastName, u.email,
     e.title, e.start_date, e.end_date, e.location_type, e.address, e.is_recurring
     FROM reservations r
     JOIN users u ON r.user_id = u.id
     JOIN events e ON r.event_id = e.id
     WHERE r.id = ?`,
    [reservationId],
    (err, [reservation]) => {
      if (err) return callback(err);
      if (!reservation) return callback(new Error('Réservation non trouvée'));

      // Récupérer les tickets
      db.query(
        `SELECT rt.*, t.ticket_type, t.advantages
         FROM reservation_tickets rt
         JOIN tickets t ON rt.ticket_id = t.id
         WHERE rt.reservation_id = ?`,
        [reservationId],
        (ticketsErr, tickets) => {
          if (ticketsErr) return callback(ticketsErr);

          // Si l'événement a des dates multiples
          if (reservation.is_recurring) {
            db.query(
              `SELECT date, start_time, end_time
               FROM event_dates
               WHERE event_id = ?
               ORDER BY date ASC, start_time ASC`,
              [reservation.event_id],
              (datesErr, dates) => {
                if (datesErr) return callback(datesErr);

                callback(null, {
                  ...reservation,
                  tickets,
                  dates, // ici on ajoute le tableau de dates au lieu de start/end_date
                });
              }
            );
          } else {
            // Événement à date simple
            callback(null, {
              ...reservation,
              tickets,
              // on renvoie quand même start_date et end_date si c'est un événement simple
              start_date: reservation.start_date,
              end_date: reservation.end_date,
              dates: null
            });
          }
        }
      );
    }
  );
}
router.post('/reservations', authenticateToken,[
  body('event_id')
    .isInt().withMessage('L\'ID de l\'événement est invalide'),
  
  body('payment_method')
    .isIn(['visa', 'mastercard', 'moov', 'orange', 'mtn', 'wave', 'djamo'])
    .withMessage('La méthode de paiement est invalide'),

  body('tickets')
    .isArray({ min: 1 }).withMessage('La liste des tickets est obligatoire'),
  
  body('tickets.*.ticket_id')
    .isInt().withMessage('L\'ID du ticket est invalide'),

  body('tickets.*.quantity')
    .isInt({ min: 1 }).withMessage('La quantité doit être au moins 1')
], (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  // Prendre le premier message seulement
  return res.status(400).json({
    msg: errors.array()[0].msg
  });
}


  const { event_id, payment_method, tickets } = req.body;
  const user_id = req.user.id;

  // Fonction de simulation de paiement sans Promise
  function simulatePayment(method, amount, callback) {
    setTimeout(() => {
      callback(null, { 
        success: true,
        transactionId: 'SIM-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });
    }, 1000);
  }

  // Démarrer la transaction
  db.query('START TRANSACTION', (startErr) => {
    if (startErr) return handleError(startErr);

    // Vérifier la disponibilité des tickets
    checkTicketsAvailability(event_id, tickets, (availErr, available) => {
      if (availErr) return handleError(availErr);
      if (!available.available) {
        return rollbackAndRespond(400, { message: available.message });
      }

      // Calculer le montant total
      calculateTotal(tickets, (totalErr, total_amount) => {
        if (totalErr) return handleError(totalErr);

        // Créer la réservation
        db.query(
          `INSERT INTO reservations 
           (user_id, event_id, total_amount, payment_method, payment_status) 
           VALUES (?, ?, ?, ?, 'pending')`,
          [user_id, event_id, total_amount, payment_method],
          (reservErr, reservation) => {
            if (reservErr) return handleError(reservErr);

            // Insérer les tickets de réservation
            let ticketsProcessed = 0;
            let hasTicketError = false;

            if (tickets.length === 0) {
              return processPayment();
            }

            tickets.forEach((item) => {
              db.query(
                'SELECT price FROM tickets WHERE id = ?', 
                [item.ticket_id],
                (ticketErr, [ticket]) => {
                  if (ticketErr || !ticket) {
                    hasTicketError = true;
                    return handleError(ticketErr || new Error('Ticket non trouvé'));
                  }

                  db.query(
                    `INSERT INTO reservation_tickets 
                     (reservation_id, ticket_id, quantity, unit_price) 
                     VALUES (?, ?, ?, ?)`,
                    [reservation.insertId, item.ticket_id, item.quantity, ticket.price],
                    (insertErr) => {
                      if (insertErr) {
                        hasTicketError = true;
                        return handleError(insertErr);
                      }

                      ticketsProcessed++;
                      if (ticketsProcessed === tickets.length && !hasTicketError) {
                        updateTicketsStock(tickets, (updateErr) => {
                          if (updateErr) return handleError(updateErr);
                          processPayment(reservation.insertId, total_amount);
                        });
                      }
                    }
                  );
                }
              );
            });
          }
        );
      });
    });
  });

  function processPayment(reservationId, total_amount) {
    simulatePayment(payment_method, total_amount, (simulateErr, paymentResult) => {
      if (simulateErr) return handleError(simulateErr);

      if (paymentResult.success) {
        db.query(
          `UPDATE reservations SET payment_status = 'completed' WHERE id = ?`,
          [reservationId],
          (updateErr) => {
            if (updateErr) return handleError(updateErr);

            db.query('COMMIT', (commitErr) => {
              if (commitErr) return handleError(commitErr);

              getFullReservation(reservationId, (detailsErr, reservationDetails) => {
                if (detailsErr) return handleError(detailsErr);

                sendConfirmationEmail(user_id, reservationId, (emailErr) => {
                  if (emailErr) console.error('Erreur email:', emailErr);

                  res.json({
                    success: true,
                    reservation: reservationDetails
                  });
                });
              });
            });
          }
        );
      } else {
        rollbackAndRespond(402, { success: false, message: 'Paiement échoué' });
      }
    });
  }

  function handleError(err) {
    console.error('Erreur:', err);
    db.query('ROLLBACK', (rollbackErr) => {
      if (rollbackErr) console.error('Erreur rollback:', rollbackErr);
      res.status(500).json({ 
        message: err.message || 'Erreur lors de la réservation',
        sqlError: err.sqlMessage
      });
    });
  }

  function rollbackAndRespond(status, response) {
    db.query('ROLLBACK', (rollbackErr) => {
      if (rollbackErr) console.error('Erreur rollback:', rollbackErr);
      res.status(status).json(response);
    });
  }
});

module.exports = router;





/*const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); 
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Configuration Stripe
const nodemailer = require('nodemailer');
router.use(cookieParser());
router.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
}));

function formatDate(dateString) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
  
    const date = new Date(dateString);
  
    // Vérifie si la date est valide
    if (isNaN(date.getTime())) {
      throw new Error('Date invalide');
    }
  
    // Formater la date selon les options définies
    return date.toLocaleDateString('fr-FR', options);
  }
  
// Fonction de calcul du prix total (version corrigée)
function calculateTotal(tickets, callback) {
  let total = 0;
  let processed = 0;

  if (tickets.length === 0) return callback(null, 0);

  tickets.forEach(item => {
    db.query(
      'SELECT price FROM tickets WHERE id = ?',
      [item.ticket_id],
      (err, [ticket]) => {
        if (err) return callback(err);
        if (!ticket) return callback(new Error(`Ticket ${item.ticket_id} introuvable`));
        
        total += item.quantity * ticket.price;
        processed++;
        
        if (processed === tickets.length) {
          callback(null, total);
        }
      }
    );
  });
}

// Fonction d'authentification du token
function authenticateToken(req, res, next) {
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
        { id: decoded.id, role: decoded.role },
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
}

// Fonction de vérification de la disponibilité des tickets
function checkTicketsAvailability(event_id, tickets, callback) {
  let availabilityCheck = { available: true, message: '' };
  let processed = 0;

  if (tickets.length === 0) {
    return callback(null, { available: false, message: 'Aucun ticket spécifié' });
  }

  tickets.forEach(ticket => {
    db.query(
      `SELECT available_tickets FROM tickets WHERE event_id = ? AND id = ?`,
      [event_id, ticket.ticket_id],
      (err, ticketInfo) => {
        if (err) return callback(err);
        
        if (!ticketInfo || ticketInfo.length === 0) {
          availabilityCheck.available = false;
          availabilityCheck.message = `Ticket avec l'ID ${ticket.ticket_id} non trouvé pour cet événement.`;
        } else if (ticket.quantity > ticketInfo[0].available_tickets) {
          availabilityCheck.available = false;
          availabilityCheck.message = `Il n'y a pas assez de tickets pour le type ${ticket.ticket_id}. Tickets disponibles: ${ticketInfo[0].available_tickets}.`;
        }

        processed++;
        if (processed === tickets.length) {
          callback(null, availabilityCheck);
        }
      }
    );
  });
}
// Mise à jour des stocks (version transactionnelle)
function updateTicketsStock(tickets, callback) {
  db.query('START TRANSACTION', (startErr) => {
    if (startErr) return callback(startErr);

    let processed = 0;
    let hasError = false;

    tickets.forEach(item => {
      db.query(
        `UPDATE tickets SET 
         available_tickets = available_tickets - ? 
         WHERE id = ? AND available_tickets >= ?`,
        [item.quantity, item.ticket_id, item.quantity],
        (err, result) => {
          if (err || result.affectedRows === 0) {
            hasError = true;
            return db.query('ROLLBACK', () => {
              callback(err || new Error(`Stock insuffisant pour le ticket ${item.ticket_id}`));
            });
          }

          processed++;
          if (processed === tickets.length && !hasError) {
            db.query('COMMIT', (commitErr) => {
              if (commitErr) return callback(commitErr);
              callback(null);
            });
          }
        }
      );
    });
  });
}

function getReservationDetails(reservationId, userId, callback) {
  // 1. Récupérer les informations de l'utilisateur
  db.query(
    `SELECT * FROM users WHERE id = ?`,
    [userId],
    (userErr, [user]) => {
      if (userErr) return callback(userErr);
      if (!user) return callback(new Error(`Utilisateur avec ID ${userId} non trouvé.`));

      // 2. Récupérer les informations de la réservation
      db.query(
        `SELECT * FROM reservations WHERE id = ? AND user_id = ?`,
        [reservationId, userId],
        (reservErr, [reservation]) => {
          if (reservErr) return callback(reservErr);
          if (!reservation) return callback(new Error(`Réservation avec ID ${reservationId} non trouvée pour cet utilisateur.`));

          // 3. Récupérer les informations de l'événement
          db.query(
            `SELECT * FROM events WHERE id = ?`,
            [reservation.event_id],
            (eventErr, [event]) => {
              if (eventErr) return callback(eventErr);
              if (!event) return callback(new Error(`Événement avec ID ${reservation.event_id} non trouvé.`));

              // 4. Retourner les informations
              callback(null, { user, reservation, event });
            }
          );
        }
      );
    }
  );
}
  
// Fonction d'envoi du mail de confirmation
function sendConfirmationEmail(userId, reservationId, callback) {
  getReservationDetails(reservationId, userId, (err, { user, reservation, event }) => {
    if (err) return callback(err);

    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    let mailOptions = {
      to: user.email,
      subject: `Confirmation de réservation - ${event.title}`,
      html: `
        <h1>Merci pour votre réservation !</h1>
        <p>Détails :</p>
        <ul>
          <li>Événement: ${event.title}</li>
          <li>Date: ${formatDate(event.start_date)}</li>
          <li>Lieu: ${event.location_type === 'online' ? 'En ligne' : event.address}</li>
          <li>Montant: ${reservation.total_amount} FCA</li>
        </ul>
        <p>Votre numéro de réservation: ${reservationId}</p>
      `
    };

    transporter.sendMail(mailOptions, (mailErr) => {
      if (mailErr) console.error('Erreur envoi email:', mailErr);
      callback(mailErr);
    });
  });
}

// Nouvelle fonction pour récupérer tous les détails
function getFullReservation(reservationId, callback) {
  db.query(
    `SELECT r.*, 
     u.firstName, u.lastName, u.email,
     e.title, e.start_date, e.location_type, e.address
     FROM reservations r
     JOIN users u ON r.user_id = u.id
     JOIN events e ON r.event_id = e.id
     WHERE r.id = ?`,
    [reservationId],
    (err, [reservation]) => {
      if (err) return callback(err);
      if (!reservation) return callback(new Error('Réservation non trouvée'));

      db.query(
        `SELECT rt.*, t.ticket_type, t.advantages
         FROM reservation_tickets rt
         JOIN tickets t ON rt.ticket_id = t.id
         WHERE rt.reservation_id = ?`,
        [reservationId],
        (ticketsErr, tickets) => {
          if (ticketsErr) return callback(ticketsErr);

          callback(null, {
            ...reservation,
            tickets
          });
        }
      );
    }
  );
}


router.post('/reservations', authenticateToken, [
  body('event_id').isInt(),
  body('payment_method').isIn(['visa', 'mastercard', 'moov', 'orange', 'mtn', 'wave', 'djamo']),
  body('tickets').isArray().notEmpty(),
  body('tickets.*.ticket_id').isInt(),
  body('tickets.*.quantity').isInt({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { event_id, payment_method, tickets } = req.body;
  const user_id = req.user.id;

  // Fonction de simulation de paiement sans Promise
  function simulatePayment(method, amount, callback) {
    setTimeout(() => {
      callback(null, { 
        success: true,
        transactionId: 'SIM-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });
    }, 1000);
  }

  // Démarrer la transaction
  db.query('START TRANSACTION', (startErr) => {
    if (startErr) return handleError(startErr);

    // Vérifier la disponibilité des tickets
    checkTicketsAvailability(event_id, tickets, (availErr, available) => {
      if (availErr) return handleError(availErr);
      if (!available.available) {
        return rollbackAndRespond(400, { message: available.message });
      }

      // Calculer le montant total
      calculateTotal(tickets, (totalErr, total_amount) => {
        if (totalErr) return handleError(totalErr);

        // Créer la réservation
        db.query(
          `INSERT INTO reservations 
           (user_id, event_id, total_amount, payment_method, payment_status) 
           VALUES (?, ?, ?, ?, 'pending')`,
          [user_id, event_id, total_amount, payment_method],
          (reservErr, reservation) => {
            if (reservErr) return handleError(reservErr);

            // Insérer les tickets de réservation
            let ticketsProcessed = 0;
            let hasTicketError = false;

            if (tickets.length === 0) {
              return processPayment();
            }

            tickets.forEach((item) => {
              db.query(
                'SELECT price FROM tickets WHERE id = ?', 
                [item.ticket_id],
                (ticketErr, [ticket]) => {
                  if (ticketErr || !ticket) {
                    hasTicketError = true;
                    return handleError(ticketErr || new Error('Ticket non trouvé'));
                  }

                  db.query(
                    `INSERT INTO reservation_tickets 
                     (reservation_id, ticket_id, quantity, unit_price) 
                     VALUES (?, ?, ?, ?)`,
                    [reservation.insertId, item.ticket_id, item.quantity, ticket.price],
                    (insertErr) => {
                      if (insertErr) {
                        hasTicketError = true;
                        return handleError(insertErr);
                      }

                      ticketsProcessed++;
                      if (ticketsProcessed === tickets.length && !hasTicketError) {
                        updateTicketsStock(tickets, (updateErr) => {
                          if (updateErr) return handleError(updateErr);
                          processPayment(reservation.insertId, total_amount);
                        });
                      }
                    }
                  );
                }
              );
            });
          }
        );
      });
    });
  });

  function processPayment(reservationId, total_amount) {
    simulatePayment(payment_method, total_amount, (simulateErr, paymentResult) => {
      if (simulateErr) return handleError(simulateErr);

      if (paymentResult.success) {
        db.query(
          `UPDATE reservations SET payment_status = 'completed' WHERE id = ?`,
          [reservationId],
          (updateErr) => {
            if (updateErr) return handleError(updateErr);

            db.query('COMMIT', (commitErr) => {
              if (commitErr) return handleError(commitErr);

              getFullReservation(reservationId, (detailsErr, reservationDetails) => {
                if (detailsErr) return handleError(detailsErr);

                sendConfirmationEmail(user_id, reservationId, (emailErr) => {
                  if (emailErr) console.error('Erreur email:', emailErr);

                  res.json({
                    success: true,
                    reservation: reservationDetails
                  });
                });
              });
            });
          }
        );
      } else {
        rollbackAndRespond(402, { success: false, message: 'Paiement échoué' });
      }
    });
  }

  function handleError(err) {
    console.error('Erreur:', err);
    db.query('ROLLBACK', (rollbackErr) => {
      if (rollbackErr) console.error('Erreur rollback:', rollbackErr);
      res.status(500).json({ 
        message: err.message || 'Erreur lors de la réservation',
        sqlError: err.sqlMessage
      });
    });
  }

  function rollbackAndRespond(status, response) {
    db.query('ROLLBACK', (rollbackErr) => {
      if (rollbackErr) console.error('Erreur rollback:', rollbackErr);
      res.status(status).json(response);
    });
  }
});

module.exports = router;


*/