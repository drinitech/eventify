const prisma = require('../config/db');

async function myNotifications(req, res) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId: req.user.id, read: false } }),
  ]);

  res.json({ notifications, unreadCount });
}

async function markRead(req, res) {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== req.user.id) {
    return res.status(404).json({ error: 'Njoftimi nuk u gjet' });
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  res.json({ notification: updated });
}

async function markAllRead(req, res) {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });

  res.status(204).send();
}

module.exports = { myNotifications, markRead, markAllRead };
