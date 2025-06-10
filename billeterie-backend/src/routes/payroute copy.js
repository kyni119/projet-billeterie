const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); 
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Configuration Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function processPayment(method, amount, paymentDetails) {
  if (['visa', 'mastercard'].includes(method)) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convertir en centimes
        currency: 'eur',
        payment_method: paymentDetails.paymentToken, // Token frontend
        confirm: true,
        metadata: {
          user_id: paymentDetails.user_id
        }
      });
      
      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: paymentIntent.id
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  // ... autres méthodes
}

//orangemoney

async function processMobileMoney(method, amount, phone) {
  const response = await axios.post('https://api.cinetpay.com/v2/payment', {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: Date.now().toString(),
    amount: amount,
    currency: 'XOF',
    description: 'Billetterie Event',
    customer_name: 'Client Event',
    customer_phone: phone,
    payment_method: method.toUpperCase() // MOOV, MTN, etc.
  });

  return {
    success: response.data.status === 'ACCEPTED',
    transactionId: response.data.transaction_id
  };
}

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


async function sendConfirmationEmail(userId, reservationId) {
  // 1. Récupérer les données
  const [user, reservation, event] = await getReservationDetails(reservationId, userId);

  // 2. Configurer le transporteur
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // 3. Contenu du mail
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
        <li>Montant: ${reservation.total_amount} €</li>
      </ul>
      <p>Votre numéro de réservation: ${reservationId}</p>
    `
  };

  // 4. Envoi
  await transporter.sendMail(mailOptions);
}

async function updateTicketsStock(tickets) {
    for (const item of tickets) {
      await db.query(
        `UPDATE tickets 
         SET available_tickets = available_tickets - ? 
         WHERE id = ? AND available_tickets >= ?`,
        [item.quantity, item.ticket_id, item.quantity]
      );
    }
  }




router.post('/reservations', authenticateToken, [
    body('event_id').isInt(),
    body('payment_method').isIn(['visa', 'mastercard', 'moov', 'orange', 'mtn', 'wave', 'djamo']),
    body('tickets').isArray().notEmpty(),
    body('tickets.*.ticket_id').isInt(),
    body('tickets.*.quantity').isInt({ min: 1 })
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
    const { event_id, payment_method, tickets, ...payment_details } = req.body;
    const user_id = req.user.id;
  
    try {
      // 1. Vérifier la disponibilité des tickets
      const availabilityCheck = await checkTicketsAvailability(event_id, tickets);
      if (!availabilityCheck.available) {
        return res.status(400).json({ message: availabilityCheck.message });
      }
  
      // 2. Calculer le montant total
      const total_amount = calculateTotal(tickets);
  
      // 3. Créer la réservation
      const [reservation] = await db.query(
        `INSERT INTO reservations SET ?`,
        {
          user_id,
          event_id,
          payment_method,
          total_amount,
          tickets_details: JSON.stringify(tickets),
          ...payment_details
        }
      );
  
      // 4. Mettre à jour les stocks (transaction)
      await updateTicketsStock(tickets);
  
      
      // 5. Remplacer simulatePayment par :
        const paymentResult = await processRealPayment(
          payment_method, 
          total_amount, 
          {
            ...payment_details,
            user_id: user_id
          }
        );

        // Gérer les échecs
        if (!paymentResult.success) {
          await db.query('UPDATE reservations SET payment_status = ? WHERE id = ?', 
            ['failed', reservation.insertId]);
          
          return res.status(402).json({
            success: false,
            message: paymentResult.error || 'Paiement refusé',
            reservationId: reservation.insertId
          });
        }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur lors de la réservation" });
    }
  });