const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const SALT_ROUNDS = 12;

function sanitizeUser(user) {
  const { passwordHash, refreshToken, googleId, ...safe } = user;
  return safe;
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: refreshTokenHash },
  });

  return { accessToken, refreshToken };
}

async function register(req, res) {
  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Nje perdorues me kete email ekziston tashme' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role || 'PARTICIPANT' },
  });

  const tokens = await issueTokens(user);

  res.status(201).json({ user: sanitizeUser(user), ...tokens });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Email ose fjalekalim i pasakte' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Email ose fjalekalim i pasakte' });
  }

  const tokens = await issueTokens(user);

  res.json({ user: sanitizeUser(user), ...tokens });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    return res.status(401).json({ error: 'Refresh token i pavlefshem ose i skaduar' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.refreshToken) {
    return res.status(401).json({ error: 'Refresh token i pavlefshem' });
  }

  const matches = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!matches) {
    return res.status(401).json({ error: 'Refresh token i pavlefshem' });
  }

  const tokens = await issueTokens(user);

  res.json({ user: sanitizeUser(user), ...tokens });
}

async function logout(req, res) {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { refreshToken: null },
  });

  res.status(204).send();
}

async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ error: 'Perdoruesi nuk u gjet' });
  }
  res.json({ user: sanitizeUser(user) });
}

async function googleCallback(req, res) {
  const tokens = await issueTokens(req.user);
  const redirectUrl = new URL('/auth/callback', process.env.FRONTEND_URL);
  redirectUrl.searchParams.set('access_token', tokens.accessToken);
  redirectUrl.searchParams.set('refresh_token', tokens.refreshToken);
  res.redirect(redirectUrl.toString());
}

module.exports = { register, login, refresh, logout, me, googleCallback };
