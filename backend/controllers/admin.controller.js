const prisma = require('../config/db');

const userListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
};

async function getStats(req, res) {
  const [usersCount, eventsCount, commentsCount, paidTickets] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.comment.count(),
    prisma.ticket.findMany({
      where: { status: { in: ['PAID', 'CHECKED_IN'] } },
      include: { event: { select: { price: true } } },
    }),
  ]);

  const totalRevenue = paidTickets.reduce((sum, t) => sum + Number(t.event.price), 0);

  res.json({
    stats: {
      usersCount,
      eventsCount,
      commentsCount,
      ticketsSold: paidTickets.length,
      totalRevenue,
    },
  });
}

async function listEvents(req, res) {
  const { status } = req.query;

  const events = await prisma.event.findMany({
    where: status ? { status } : undefined,
    include: { organizer: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ events });
}

async function moderateEvent(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return res.status(404).json({ error: 'Eventi nuk u gjet' });
  }

  const updated = await prisma.event.update({ where: { id }, data: { status } });

  res.json({ event: updated });
}

async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: userListSelect,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ users });
}

async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ error: 'Perdoruesi nuk u gjet' });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: userListSelect,
  });

  res.json({ user: updated });
}

async function deleteUser(req, res) {
  const { id } = req.params;

  if (id === req.user.id) {
    return res.status(400).json({ error: 'Nuk mund te fshish llogarine tende si admin' });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ error: 'Perdoruesi nuk u gjet' });
  }

  await prisma.user.delete({ where: { id } });

  res.status(204).send();
}

module.exports = { getStats, listEvents, moderateEvent, listUsers, updateUserRole, deleteUser };
