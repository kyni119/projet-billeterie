
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const dayjs = require('dayjs');


// Données de connexion admin (ultra basique, à sécuriser plus tard !)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin@123'
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    res.json({ success: true, message: "Connexion réussie" });
  } else {
    res.status(401).json({ success: false, message: "Identifiants invalides" });
  }
});


// ✅ Fermer les événements terminés
router.post('/close-past-events', (req, res) => {
  const today = dayjs().format('YYYY-MM-DD');

  // 1️⃣ Événements ponctuels dont la end_date est passée
  const closeNonRecurring = `
    UPDATE events
    SET status = 1
    WHERE is_recurring = 0
      AND end_date < ?
      AND status = 0
  `;

  // 2️⃣ Événements récurrents dont toutes les dates sont passées
  const closeRecurring = `
    UPDATE events
    SET status = 1
    WHERE is_recurring = 1
      AND id NOT IN (
        SELECT event_id
        FROM event_dates
        WHERE date >= ?
      )
      AND status = 0
  `;

  // Exécution des deux requêtes
  db.query(closeNonRecurring, [today], (err1, result1) => {
    if (err1) {
      console.error('Erreur update non-récurrents :', err1);
      return res.status(500).json({ message: "Erreur lors de la mise à jour des événements ponctuels" });
    }

    db.query(closeRecurring, [today], (err2, result2) => {
      if (err2) {
        console.error('Erreur update récurrents :', err2);
        return res.status(500).json({ message: "Erreur lors de la mise à jour des événements récurrents" });
      }

      res.json({
        message: "Événements mis à jour avec succès",
        nonRecurringUpdated: result1.affectedRows,
        recurringUpdated: result2.affectedRows
      });
    });
  });
});

router.post('/closeEventsIfNeeded', (req, res) => {
    const now = new Date();
    const closedEvents = [];
  
    db.query(`SELECT * FROM events WHERE status = 0`, (err, events) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
  
      if (!events.length) return res.json({ message: "Aucun événement à traiter" });
  
      let processed = 0;
  
      events.forEach(event => {
        const eventId = event.id;
  
        // 1. Vérification PRIORITAIRE des tickets
        db.query(`SELECT SUM(available_tickets) AS total FROM tickets WHERE event_id = ?`, 
        [eventId], 
        (ticketErr, [ticketRes]) => {
          if (ticketErr) {
            console.error(`Erreur tickets pour ${eventId}`, ticketErr);
            return checkCompletion();
          }
  
          const totalTickets = ticketRes?.total ?? 0;
  
          // CAS 1 - Fermeture immédiate si plus de tickets
          if (totalTickets === 0) {
            return closeEvent(eventId, "plus de tickets disponibles");
          }
  
          // CAS 2 - Vérification des dates seulement si tickets disponibles
          checkDates(event, eventId);
        });
      });
  
      function checkDates(event, eventId) {
        if (event.is_recurring) {
            db.query(
              `SELECT * FROM event_dates 
               WHERE event_id = ? 
               ORDER BY date, start_time`,
              [eventId],
              (datesErr, dates) => {
                if (datesErr) {
                  console.error(`Erreur dates pour event ${eventId}`, datesErr);
                  return checkCompletion();
                }

                // Vérifier si toutes les dates sont passées
                const allDatesPassed = dates.every(dateObj => {
                  const endDateTime = new Date(`${dateObj.date}T${dateObj.end_time}`);
                  return endDateTime < now;
                });

                if (allDatesPassed) {
                  closeEvent(eventId, "toutes les dates multiples sont passées");
                } else {
                  checkCompletion();
                }
              }
            );
          }  
          
           // Cas 3: Événement avec date unique
           else {
            const endDate = event.end_date ? new Date(event.end_date) : 
                          event.start_date ? new Date(event.start_date) : null;

            if (!endDate) {
              console.log(`Event ${eventId} sans date de fin valide - non fermé`);
              return checkCompletion();
            }

            if (endDate < now) {
              closeEvent(eventId, "date unique passée");
            } else {
              checkCompletion();
            }
          }
      }
  
      function closeEvent(id, reason) {
        db.query(`UPDATE events SET status = 1 WHERE id = ?`, [id], (updateErr) => {
          if (!updateErr) {
            closedEvents.push(id);
            console.log(`Événement ${id} fermé (${reason})`);
          }
          checkCompletion();
        });
      }
  
      function checkCompletion() {
        processed++;
        if (processed === events.length) {
          res.json({
            success: true,
            closedEvents,
            message: closedEvents.length 
              ? `${closedEvents.length} guichet(s) fermé(s)` 
              : "Aucun guichet à fermer"
          });
        }
      }
    });
});

router.get('/getRemainingTickets/:event_id', (req, res) => {
    const eventId = req.params.event_id;
  
    db.query(`
      SELECT ticket_type, available_tickets 
      FROM tickets 
      WHERE event_id = ?
    `, [eventId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la récupération des tickets", error: err });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: "Aucun ticket trouvé pour cet événement" });
      }
  
      const total = results.reduce((acc, t) => acc + t.available_tickets, 0);
      
      res.json({
        event_id: eventId,
        total_remaining: total,
        breakdown: results.map(t => ({
          type: t.ticket_type,
          remaining: t.available_tickets
        }))
      });
    });
});

router.post('/closeManually/:eventId', (req, res) => {
    const eventId = req.params.eventId;
  
    db.query(
      `UPDATE events SET status = 1 WHERE id = ?`,
      [eventId],
      (err, result) => {
        if (err) {
          console.error('Erreur SQL:', err);
          return res.status(500).json({ message: "Erreur serveur lors de la fermeture du guichet" });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Événement non trouvé" });
        }
  
        res.json({ message: `Le guichet de l'événement ${eventId} est maintenant fermé.` });
      }
    );
  });
  

module.exports = router;
