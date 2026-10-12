process.env.JWT_SECRET = 'test-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const app = require('../src/server');

let server;
let base;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

const call = (path, { method = 'GET', cookie, headers = {}, body } = {}) =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

const token = (payload, opts = { expiresIn: '1h' }) => jwt.sign(payload, process.env.JWT_SECRET, opts);

test('les routes admin sans authentification renvoient 401', async () => {
  for (const [method, path] of [
    ['POST', '/admin/close-past-events'],
    ['POST', '/admin/closeEventsIfNeeded'],
    ['POST', '/admin/closeManually/1'],
    ['GET', '/admin/getRemainingTickets/1'],
  ]) {
    const res = await call(path, { method });
    assert.strictEqual(res.status, 401, `${method} ${path}`);
  }
});

test('un utilisateur normal ou organisateur ne peut pas accéder à /admin', async () => {
  for (const role of [0, 1]) {
    const cookie = `access_token=${token({ id: 5, role, type: 'access' })}`;
    const res = await call('/admin/closeManually/1', { method: 'POST', cookie });
    assert.strictEqual(res.status, 403, `role ${role}`);
  }
});

test('les anciens identifiants admin codés en dur ne fonctionnent plus', async () => {
  const res = await call('/admin/login', { method: 'POST', body: { username: 'admin', password: 'admin@123' } });
  assert.notStrictEqual(res.status, 200);
});

test('un refresh token ne peut pas servir d’access token', async () => {
  const cookie = `access_token=${token({ id: 1, role: 0, type: 'refresh' })}`;
  const res = await call('/account/getProfile', { cookie });
  assert.strictEqual(res.status, 403);
});

test('un client ne peut pas créer un événement (rôle organisateur requis)', async () => {
  const cookie = `access_token=${token({ id: 5, role: 0, type: 'access' })}`;
  const res = await call('/account/create-event', { method: 'POST', cookie, body: {} });
  assert.strictEqual(res.status, 403);
});

test('réservation sans authentification refusée', async () => {
  const res = await call('/pay/reservations', { method: 'POST', body: {} });
  assert.strictEqual(res.status, 401);
});

test('une requête POST depuis une autre origine est bloquée (CSRF)', async () => {
  const res = await call('/auth/logout', { method: 'POST', headers: { Origin: 'http://evil.example' } });
  assert.strictEqual(res.status, 403);
});

test('le login est limité en débit', async () => {
  let last;
  for (let i = 0; i < 12; i++) {
    last = await call('/auth/login', { method: 'POST', body: { email: 'x', password: 'y' } });
  }
  assert.strictEqual(last.status, 429);
});

test('le dossier public n’est plus exposé, 404 JSON sur route inconnue', async () => {
  const res = await call('/public/uploads/../../.env');
  assert.strictEqual(res.status, 404);
});
