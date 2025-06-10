const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateTicketPDF(reservation, outputPath) {
  return new Promise((resolve, reject) => {

     const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      layout: 'portrait',
      info: {
        Title: `Billet Ticky - ${reservation.title}`,
        Author: 'Ticky',
        Creator: 'Ticky PDF Generator'
      }
    });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    

    // En-tête avec couleur unie (remplace le dégradé)
    doc
      .fillColor('#4285F4') // Bleu Google
      .rect(0, 0, doc.page.width, 80)
      .fill()
      // .image(path.join(__dirname, 'assets/logo.png'), 50, 20, { width: 120 }) // Décommentez si vous avez un logo
      .fillColor('#ffffff')
      .fontSize(20)
      .text('TICKY', 50, 30)
      .moveDown(3);

    // Titre principal
    doc
      .fontSize(24)
      .fillColor('#4285F4')
      .moveTo(50, 100)
      .lineTo(doc.page.width - 50, 100)
      .strokeColor('#EA4335') // Rouge Google
      .stroke();

    // Section informations client
    doc
      .fontSize(14)
      .fillColor('#4285F4')
      .text('INFORMATIONS CLIENT', 50, 130)
      .fontSize(12)
      .fillColor('#333333')
      .text(`Nom complet : ${reservation.firstName ?? ''} ${reservation.lastName ?? ''}`, 50, 160)
      .text(`Email : ${reservation.email ?? ''}`, 50, 180)
      .text(`N° réservation : ${reservation.id}`, 50, 200)
      .text(`Date réservation : ${new Date(reservation.created_at).toLocaleString()}`, 50, 220)
      .moveDown();

    // Section événement
    doc
      .fontSize(14)
      .fillColor('#4285F4')
      .text('DÉTAILS DE L\'ÉVÉNEMENT', 50, 260)
      .fontSize(12)
      .fillColor('#333333')
      .text(`Titre : ${reservation.title ?? ''}`, 50, 290)
      .text(`Type : ${reservation.location_type === 'online' ? 'Événement en ligne' : 'Présentiel'}`, 50, 310);
    
    if (reservation.location_type !== 'online') {
      doc.text(`Adresse : ${reservation.address ?? 'Non précisé'}`, 50, 330);
    }
    
    // Dates
    doc.text('Dates :', 50, 350);
    if (reservation.dates && reservation.dates.length > 0) {
      reservation.dates.forEach((d, i) => {
        doc.text(` • ${d.date} de ${d.start_time} à ${d.end_time}`, 70, 370 + (i * 20));
      });
    } else {
      doc.text(` • Du ${reservation.start_date ?? ''} au ${reservation.end_date ?? ''}`, 70, 370);
    }

    // Section tickets
    doc
      .fontSize(14)
      .fillColor('#4285F4')
      .text('Billets réservés', 50, 450)
      .fontSize(12)
      .fillColor('#333333');
    
    if (reservation.tickets?.length > 0) {
      reservation.tickets.forEach((ticket, i) => {
        doc.text(` • ${ticket.quantity ?? '1'} x ${ticket.ticket_type ?? 'Billet standard'}`, 70, 480 + (i * 20));
        if (ticket.advantages) {
          doc.fontSize(10).fillColor('#666666').text(`   Avantages : ${ticket.advantages}`, 90, 495 + (i * 20));
          doc.fontSize(12).fillColor('#333333');
        }
      });
    } else {
      doc.text('Aucun billet trouvé', 70, 480);
    }

    // Section paiement
    doc
      .fontSize(14)
      .fillColor('#4285F4')
      .text('INFORMATIONS DE PAIEMENT', 50, 550)
      .fontSize(12)
      .fillColor('#333333')
      .text(`Méthode : ${reservation.payment_method ?? 'Non spécifié'}`, 50, 580)
      .text(`Montant total : ${reservation.total_amount ?? '0'} FCFA`, 50, 600);

    // Pied de page
    doc
      .fontSize(10)
      .fillColor('#666666')
      .text('Merci pour votre confiance', { align: 'center' })
      .text('Ticky - Plateforme de billetterie en ligne', { align: 'center' })
      .text('support@ticky.com | www.ticky.com', { align: 'center' });

    doc.end();
  });
}

module.exports = generateTicketPDF;
