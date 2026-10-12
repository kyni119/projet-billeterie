const jwt = require('jsonwebtoken');

const ACCESS_TTL_MS = 60 * 60 * 1000; // 1h
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

const ROLE_ORGANIZER = 1;
const ROLE_ADMIN = 'admin';

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge,
});

function signAccessToken({ id, role }) {
  return jwt.sign({ id, role, type: 'access' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function signRefreshToken({ id, role }) {
  return jwt.sign({ id, role, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookies(res, user) {
  res.cookie('access_token', signAccessToken(user), cookieOptions(ACCESS_TTL_MS));
  res.cookie('refresh_token', signRefreshToken(user), cookieOptions(REFRESH_TTL_MS));
}

function clearAuthCookies(res) {
  res.clearCookie('access_token', cookieOptions(0));
  res.clearCookie('refresh_token', cookieOptions(0));
}

// Vérifie un token en imposant son type (un refresh token ne peut pas servir d'access token)
function verifyToken(token, type) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.type && decoded.type !== type) {
    throw new jwt.JsonWebTokenError('Mauvais type de token');
  }
  return decoded;
}

// Middleware unique d'authentification (access token + rafraîchissement transparent)
function authenticateToken(req, res, next) {
  const { access_token: accessToken, refresh_token: refreshToken } = req.cookies || {};

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ errorCode: 'AUTH_REQUIRED', message: 'Authentification requise' });
  }

  if (accessToken) {
    try {
      req.user = verifyToken(accessToken, 'access');
      return next();
    } catch (e) {
      if (e.name !== 'TokenExpiredError') {
        return res.status(403).json({ errorCode: 'INVALID_TOKEN', message: 'Token invalide' });
      }
      // expiré : on tente le rafraîchissement ci-dessous
    }
  }

  if (refreshToken) {
    try {
      const decoded = verifyToken(refreshToken, 'refresh');
      const user = { id: decoded.id, role: decoded.role };
      res.cookie('access_token', signAccessToken(user), cookieOptions(ACCESS_TTL_MS));
      req.user = user;
      return next();
    } catch (e) {
      clearAuthCookies(res);
      return res.status(401).json({ errorCode: 'SESSION_EXPIRED', message: 'Session expirée' });
    }
  }

  return res.status(401).json({ errorCode: 'TOKEN_EXPIRED', message: 'Session expirée' });
}

// Restreint une route à un ou plusieurs rôles (à placer après authenticateToken)
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
};

const requireOrganizer = requireRole(ROLE_ORGANIZER);
const requireAdmin = [authenticateToken, requireRole(ROLE_ADMIN)];

module.exports = {
  ROLE_ORGANIZER,
  ROLE_ADMIN,
  authenticateToken,
  requireRole,
  requireOrganizer,
  requireAdmin,
  setAuthCookies,
  clearAuthCookies,
  verifyToken,
  signAccessToken,
};
