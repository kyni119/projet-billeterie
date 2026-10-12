// ⚠️ SIMULATION : aucun prestataire de paiement n'est branché.
// Remplacer cette fonction par l'appel réel (CinetPay, Wave, Stripe...) avant toute mise en production.
// En production, la simulation est désactivée sauf si ALLOW_SIMULATED_PAYMENTS=true.
async function processPayment({ method, amount }) {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SIMULATED_PAYMENTS !== 'true') {
    throw new Error('Aucun prestataire de paiement configuré');
  }
  return {
    success: true,
    transactionId: 'SIM-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
  };
}

module.exports = { processPayment };
