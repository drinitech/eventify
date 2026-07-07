const express = require('express');
const rateLimit = require('express-rate-limit');
const passport = require('../config/passport');
const { validate } = require('../middleware/validation.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { registerSchema, loginSchema, refreshSchema } = require('../validation/auth.schema');
const authController = require('../controllers/auth.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Shume kerkesa, provo perseri me vone' },
});

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', authLimiter, validate(refreshSchema), asyncHandler(authController.refresh));
router.post('/logout', requireAuth, asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  asyncHandler(authController.googleCallback)
);

module.exports = router;
