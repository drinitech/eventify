const prisma = require('../config/db');

async function notifyNewEvent(event) {
  const [follows, organizer] = await Promise.all([
    prisma.follow.findMany({ where: { organizerId: event.organizerId }, select: { followerId: true } }),
    prisma.user.findUnique({ where: { id: event.organizerId }, select: { name: true } }),
  ]);

  if (follows.length === 0) return;

  const message = `${organizer.name} publikoi nje event te ri: "${event.title}"`;
  await prisma.notification.createMany({
    data: follows.map((f) => ({ userId: f.followerId, message })),
  });
}

async function notifyAttendees(eventId, message) {
  const tickets = await prisma.ticket.findMany({
    where: { eventId, status: { not: 'CANCELLED' } },
    select: { userId: true },
  });

  if (tickets.length === 0) return;

  await prisma.notification.createMany({
    data: tickets.map((t) => ({ userId: t.userId, message })),
  });
}

module.exports = { notifyNewEvent, notifyAttendees };
