const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendConfirmationEmail } = require('../services/confirmationEmail');
const { processPayment } = require('../services/payment');

const pool = db.promise();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Récupère la réservation complète (utilisateur, événement, billets, dates)
async function getFullReservation(executor, reservationId) {
  const [[reservation]] = await executor.query(
    `SELECT r.*,
       u.firstName, u.lastName, u.email,
       e.title, e.start_date, e.end_date, e.location_type, e.address, e.is_recurring
     FROM reservations r
     JOIN users u ON r.user_id = u.id
     JOIN events e ON r.event_id = e.id
     WHERE r.id = ?`,
    [reservationId]
  );
  if (!reservation) throw new Error('Réservation non trouvée');

  const [tickets] = await executor.query(
    `SELECT rt.*, t.ticket_type, t.advantages
     FROM reservation_tickets rt
     JOIN tickets t ON rt.ticket_id = t.id
     WHERE rt.reservation_id = ?`,
    [reservationId]
  );

  let dates = null;
  if (reservation.is_recurring) {
    [dates] = await executor.query(
      `SELECT date, start_time, end_time FROM event_dates
       WHERE event_id = ? ORDER BY date ASC, start_time ASC`,
      [reservation.event_id]
    );
  }
  return { ...reservation, tickets, dates };
}

// Crée la réservation dans UNE transaction sur UNE connexion dédiée :
// les stocks sont verrouillés (FOR UPDATE), les prix viennent de la base (jamais du client).
async function createReservation({ userId, eventId, paymentMethod, requested }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[event]] = await conn.query('SELECT id, status FROM events WHERE id = ?', [eventId]);
    if (!event) throw new HttpError(404, 'Événement introuvable.');
    if (event.status !== 0) throw new HttpError(400, "La billetterie de cet événement n'est pas ouverte.");

    // Verrou des lignes billets, dans un ordre stable pour éviter les deadlocks
    const lines = [];
    let totalAmount = 0;
    for (const item of [...requested].sort((a, b) => a.ticket_id - b.ticket_id)) {
      const [[ticket]] = await conn.query(
        'SELECT id, price, available_tickets FROM tickets WHERE id = ? AND event_id = ? FOR UPDATE',
        [item.ticket_id, eventId]
      );
      if (!ticket) {
        throw new HttpError(400, `Ticket avec l'ID ${item.ticket_id} non trouvé pour cet événement.`);
      }
      if (item.quantity > ticket.available_tickets) {
        throw new HttpError(
          400,
          `Il n'y a pas assez de tickets pour le type ${item.ticket_id}. Tickets disponibles: ${ticket.available_tickets}.`
        );
      }
      totalAmount += item.quantity * Number(ticket.price);
      lines.push({ ...item, unit_price: ticket.price });
    }

    const [reservation] = await conn.query(
      `INSERT INTO reservations (user_id, event_id, total_amount, payment_method, payment_status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, eventId, totalAmount, paymentMethod]
    );

    for (const line of lines) {
      await conn.query(
        `INSERT INTO reservation_tickets (reservation_id, ticket_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [reservation.insertId, line.ticket_id, line.quantity, line.unit_price]
      );
      await conn.query(
        'UPDATE tickets SET available_tickets = available_tickets - ? WHERE id = ?',
        [line.quantity, line.ticket_id]
      );
    }

    const payment = await processPayment({ method: paymentMethod, amount: totalAmount });
    if (!payment.success) throw new HttpError(402, 'Paiement échoué');

    await conn.query("UPDATE reservations SET payment_status = 'completed' WHERE id = ?", [reservation.insertId]);
    await conn.commit();
    return reservation.insertId;
  } catch (err) {
    await conn.rollback().catch((rollbackErr) => console.error('Erreur rollback:', rollbackErr.message));
    throw err;
  } finally {
    conn.release();
  }
}

router.post('/reservations', authenticateToken, [
  body('event_id').isInt({ min: 1 }).withMessage("L'ID de l'événement est invalide"),
  body('payment_method')
    .isIn(['visa', 'mastercard', 'moov', 'orange', 'mtn', 'wave', 'djamo'])
    .withMessage('La méthode de paiement est invalide'),
  body('tickets').isArray({ min: 1, max: 20 }).withMessage('La liste des tickets est obligatoire'),
  body('tickets.*.ticket_id').isInt({ min: 1 }).withMessage("L'ID du ticket est invalide"),
  body('tickets.*.quantity').isInt({ min: 1, max: 20 }).withMessage('La quantité doit être entre 1 et 20'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { event_id, payment_method, tickets } = req.body;

  // Fusionne les lignes d'un même ticket (évite de contourner la vérification de stock en le répétant)
  const merged = new Map();
  for (const t of tickets) {
    const id = Number(t.ticket_id);
    merged.set(id, (merged.get(id) || 0) + Number(t.quantity));
  }
  const requested = [...merged].map(([ticket_id, quantity]) => ({ ticket_id, quantity }));

  let reservationId;
  try {
    reservationId = await createReservation({
      userId: req.user.id,
      eventId: Number(event_id),
      paymentMethod: payment_method,
      requested,
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('Erreur réservation:', err);
    return res.status(500).json({ success: false, message: 'Erreur lors de la réservation' });
  }

  // La réservation est validée : un échec d'email ne doit pas la remettre en cause
  try {
    const reservation = await getFullReservation(pool, reservationId);
    try {
      await sendConfirmationEmail(reservation);
    } catch (emailErr) {
      console.error('Erreur email:', emailErr.message);
    }
    return res.json({ success: true, reservation });
  } catch (err) {
    console.error('Erreur lecture réservation:', err);
    return res.status(500).json({ success: false, message: 'Réservation enregistrée mais indisponible, consultez vos réservations.' });
  }
});

module.exports = router;
