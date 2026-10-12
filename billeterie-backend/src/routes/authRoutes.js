const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const xss = require("xss");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const rateLimit = require('../middleware/rateLimit');
const { setAuthCookies, clearAuthCookies, signAccessToken, verifyToken } = require('../middleware/auth');

// Anti brute-force sur les routes sensibles
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: 'Trop de créations de compte. Réessayez plus tard.' });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de demandes. Réessayez dans 15 minutes.' });


function sendResetPasswordEmail(email, resetLink) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });


  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - MEJ Grand Bassam',
    html: `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .logo {
            height: 60px;
            margin-bottom: 15px;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        .message {
            margin-bottom: 25px;
            color: #34495e;
        }
        .btn-container {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
            color: white !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 500;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }
        .link-text {
            font-size: 14px;
            color: #7f8c8d;
            margin-top: 20px;
            word-break: break-all;
        }
        .link-text a {
            color: #28a745;
            text-decoration: none;
        }
        .warning {
            background-color: #f8f9fa;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 25px 0;
            font-size: 14px;
            color: #555;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #7f8c8d;
            font-size: 12px;
        }
        .verse {
            font-style: italic;
            color: #28a745;
            margin: 20px 0;
            text-align: center;
        }
        .social-icons {
            margin-top: 15px;
        }
        .social-icons a {
            margin: 0 10px;
            display: inline-block;
        }
        .social-icon {
            width: 32px;
            height: 32px;
            transition: transform 0.3s;
        }
        .social-icon:hover {
            transform: scale(1.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <img src="${resetBaseUrl}/logo_mej.png" alt="MEJ Grand Bassam" class="logo"> 
            <h1>Réinitialisation de votre mot de passe</h1>
        </div>
        
        <!-- Content Section -->
        <div class="content">
            <div class="greeting">Bonjour cher utilisateur,</div>
            
            <div class="message">
                <p>Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message. Aucune action ne sera effectuée sur votre compte.</p>
                <p>Pour réinitialiser votre mot de passe, veuillez cliquer sur le bouton ci-dessous :</p>
            </div>
            
            <!-- Call to Action Button -->
            <div class="btn-container">
                <a href="${resetLink}" class="btn">Réinitialiser mon mot de passe</a>
            </div>
            
            <!-- Alternative Link -->
            <div class="link-text">
                Si le bouton ci-dessus ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${resetLink}">${resetLink}</a>
            </div>
            
            <!-- Warning/Info Box -->
            <div class="warning">
                <strong>Important :</strong> Ce lien expirera dans 15 minutes pour des raisons de sécurité. Si vous ne réinitialisez pas votre mot de passe dans ce délai, vous devrez faire une nouvelle demande.
            </div>
            
        </div>
        
        <!-- Footer Section -->
        <div class="footer">
            <p>© ${new Date().getFullYear()} Ticky. Tous droits réservés.</p>
            
            <div class="social-icons">
                <a href="https://www.facebook.com/mejgrandbassam" target="_blank">
                    <img src="${resetBaseUrl}/logo_facebook.jpeg" alt="Facebook MEJ" class="social-icon">
                </a>
                <!-- Vous pouvez ajouter d'autres réseaux sociaux ici -->
            </div>
            
            <p style="margin-top: 15px;">
                Pour toute question, contactez-nous à <a href="mailto:contact@mej-grandbassam.org" style="color: #28a745;">contact@Ticky.org</a>
            </p>
        </div>
    </div>
</body>

</html>
    `,
};

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Erreur lors de l\'envoi de l\'email:', error);
        return;
      }
      console.log('Email envoyé:', info.response);
    });
  } catch (error) {
    console.log('Erreur lors de l\'envoi du mail:', error);
  }
}

router.post('/reset-password-request', resetLimiter, (req, res) => {
  const { email } = req.body;
  // Réponse identique que l'email existe ou non (pas d'énumération de comptes)
  const genericResponse = { message: 'Si cet email est associé à un compte, vous recevrez un email pour réinitialiser votre mot de passe.' };

  if (typeof email !== 'string' || !email) {
    return res.status(400).json({ message: 'Email requis.' });
  }

  db.query('SELECT email, password FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'email:', err.message);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
    if (result.length === 0) return res.status(200).json(genericResponse);

    // Le token embarque une empreinte du mot de passe actuel : il devient invalide dès usage
    const token = jwt.sign(
      { email, type: 'reset', pwf: result[0].password.slice(-12) },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    sendResetPasswordEmail(email, resetLink);
    res.status(200).json(genericResponse);
  });
});
router.post('/reset-password', resetLimiter,
  body('newPassword')
    .notEmpty().withMessage('Le mot de passe est requis.')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule.')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule.')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
    .matches(/[\W_]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.'),

  (req, res) => {
    const { token, newPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorCode: 1,
        errorMessage: errors.array().map(err => err.msg)
      });
    }

    if (!token) {
      return res.status(400).json({ message: 'Token manquant.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || decoded.type !== 'reset') {
        return res.status(400).json({ message: 'Token invalide ou expiré.' });
      }

      db.query('SELECT id, password FROM users WHERE email = ?', [decoded.email], (selErr, rows) => {
        if (selErr) return res.status(500).json({ message: 'Erreur serveur.' });
        // Le token ne fonctionne que tant que le mot de passe n'a pas changé
        if (rows.length === 0 || rows[0].password.slice(-12) !== decoded.pwf) {
          return res.status(400).json({ message: 'Token invalide ou expiré.' });
        }

        bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
          if (hashErr) return res.status(500).json({ message: 'Erreur serveur.' });

          db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, rows[0].id], (updErr) => {
            if (updErr) return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe.' });
            res.status(200).json({ message: 'Le mot de passe a été réinitialisé avec succès.' });
          });
        });
      });
    });
  }
);
router.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Token de rafraîchissement manquant' });
  }
  try {
    const decoded = verifyToken(refreshToken, 'refresh');
    const accessToken = signAccessToken({ id: decoded.id, role: decoded.role });
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });
    return res.status(200).json({ message: 'Token rafraîchi avec succès' });
  } catch (err) {
    return res.status(401).json({ message: 'Token de rafraîchissement invalide ou expiré' });
  }
});
router.post('/logout', (req, res) => {
  clearAuthCookies(res);
  return res.status(200).json({ message: "Déconnexion réussie." });
});
router.post('/register', registerLimiter, [
   
    body('firstName').notEmpty().withMessage('Le prénom est requis.'),
    body('lastName').notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('Email invalide.'),
    body('phoneNumber')
      .notEmpty().withMessage('Numéro de téléphone requis.')
      .isLength({ min: 5 }).withMessage('Le numéro de téléphone doit être valide.'),
    body('password')
      .notEmpty().withMessage('Mot de passe requis.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/)
      .withMessage('Le mot de passe doit contenir une majuscule, une minuscule, un caractère spécial, et faire au moins 8 caractères.'),
    body('profile')
      .notEmpty().withMessage('Le profil est requis.')
      .isIn([0, 1]).withMessage('Le profil doit être 0 (Client) ou 1 (Organisateur).')
  ], async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    let { firstName, lastName, email, password, phoneNumber, profile } = req.body;
  
    
    firstName = xss(firstName);
    lastName = xss(lastName);
    email = xss(email);
    phoneNumber = xss(phoneNumber);
    profile = xss(profile);
  
    try {
      
      db.query(
        'SELECT * FROM users WHERE email = ? OR phoneNumber = ?',
        [email, phoneNumber],
        async (err, results) => {
          if (err) return res.status(500).json({ message: 'Erreur serveur.' });
  
          if (results.length > 0) {
            return res.status(400).json({ message: 'Email ou numéro déjà utilisé.' });
          }
  
          // Hasher le mot de passe
          const hashedPassword = await bcrypt.hash(password, 10);
  
          db.query(
            'INSERT INTO users (firstName, lastName, email, password, phoneNumber, profile) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword, phoneNumber, profile],
            (insertErr, result) => {
              if (insertErr) {
                return res.status(500).json({ message: 'Erreur lors de la création du compte.' });
              }
  
              return res.status(200).json({ message: 'Compte créé avec succès.' });
            }
          );
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Erreur interne.' });
    }
});
router.post('/login', loginLimiter, [
    body('email').isEmail().withMessage('Email invalide.'),
    body('password').notEmpty().withMessage('Le mot de passe est requis.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });

    // Même message que l'email soit inconnu ou le mot de passe faux
    const invalid = () => res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    if (results.length === 0) return invalid();

    const user = results[0];
    try {
      if (!(await bcrypt.compare(password, user.password))) return invalid();
    } catch (e) {
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }

    // Les tokens ne transitent que par des cookies httpOnly (jamais dans le corps JSON)
    setAuthCookies(res, { id: user.id, role: user.profile });

    return res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profile: user.profile,
        balance: user.balance,
        totalSpent: user.totalSpent,
        numOrders: user.numOrders,
      },
    });
  });
});

module.exports = router;
