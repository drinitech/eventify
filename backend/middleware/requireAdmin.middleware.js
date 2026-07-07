const prisma = require('../config/db');

async function requireAdmin(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Kerkohet rol Admin' });
  }
  next();
}

module.exports = { requireAdmin };
