const nodemailer = require('nodemailer');
const generateTicketPDF = require('../models/reservationPdf');

// Échappe les valeurs saisies par les utilisateurs avant insertion dans le HTML de l'email
const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });
  }
  return transporter;
};

const buildHtml = (reservation) => `
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
            <p>Bonjour <span class="highlight">${esc(reservation.firstName ?? '')} ${esc(reservation.lastName ?? '')}</span>,</p>
            <p>Votre réservation pour <span class="highlight">${esc(reservation.title)}</span> a bien été enregistrée. Voici un récapitulatif :</p>
            
            <div class="ticket">
                <h2>🎟 Détails de votre billet</h2>
                <p><strong>Référence :</strong> ${esc(reservation.id)}</p>
                <p><strong>Événement :</strong> ${esc(reservation.title)}</p>
                <p><strong>Lieu :</strong> ${reservation.location_type === 'online' ? 'Événement en ligne' : reservation.address}</p>
                
                <p><strong>Date(s) :</strong></p>
                <ul>
                    ${reservation.dates
                      ? reservation.dates.map(d => `<li>${esc(d.date)} de ${esc(d.start_time)} à ${esc(d.end_time)}</li>`).join('')
                      : `<li>${esc(reservation.start_date ?? '')} → ${esc(reservation.end_date ?? '')}</li>`}
                </ul>
                
                <p><strong>Billets :</strong></p>
                <ul>
                    ${reservation.tickets?.map(ticket => 
                      `<li>${esc(ticket.quantity)} x ${esc(ticket.ticket_type)}${ticket.advantages ? ` (${esc(ticket.advantages)})` : ''}</li>`
                    ).join('') || '<li>Aucun billet trouvé</li>'}
                </ul>
                
                <p><strong>Total payé :</strong> ${esc(reservation.total_amount)} FCFA</p>
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
          `;

// Envoie l'email de confirmation avec le billet PDF en pièce jointe
async function sendConfirmationEmail(reservation) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Configuration email absente (EMAIL_USER / EMAIL_PASSWORD)');
  }
  const pdfBuffer = await generateTicketPDF(reservation);
  await getTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to: reservation.email,
    subject: `🎟 Votre billet pour ${reservation.title}`,
    html: buildHtml(reservation),
    attachments: [{ filename: `Ticky_Billet_${reservation.id}.pdf`, content: pdfBuffer }],
  });
}

module.exports = { sendConfirmationEmail };
