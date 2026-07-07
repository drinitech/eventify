const { verifyAccessToken } = require('../utils/jwt');

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.split(' ')[1]);
      req.user = { id: payload.sub, role: payload.role };
    } catch (err) {
      // token invalid/expired: proceed as anonymous
    }
  }
  next();
}

module.exports = { optionalAuth };
