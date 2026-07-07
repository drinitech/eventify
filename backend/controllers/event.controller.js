const prisma = require('../config/db');

const organizerSelect = { id: true, name: true, avatarUrl: true, bio: true };

async function createEvent(req, res) {
  const data = req.body;

  const event = await prisma.event.create({
    data: {
      ...data,
      organizerId: req.user.id,
      status: 'PUBLISHED',
    },
  });

  res.status(201).json({ event });
}

async function listEvents(req, res) {
  const { category, q, minPrice, maxPrice, dateFrom, dateTo, page, limit } = req.query;

  const where = {
    status: 'PUBLISHED',
    ...(category && { category }),
    ...(q && { title: { contains: q, mode: 'insensitive' } }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
    ...((dateFrom || dateTo) && {
      date: {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      },
    }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { organizer: { select: organizerSelect } },
      orderBy: { date: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  res.json({
    events,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

async function getEvent(req, res) {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { organizer: { select: organizerSelect } },
  });

  if (!event) {
    return res.status(404).json({ error: 'Eventi nuk u gjet' });
  }

  const isOwner = req.user && req.user.id === event.organizerId;
  if (event.status !== 'PUBLISHED' && !isOwner) {
    return res.status(404).json({ error: 'Eventi nuk u gjet' });
  }

  res.json({ event });
}

async function loadOwnedEvent(req, res) {
  const { id } = req.params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    res.status(404).json({ error: 'Eventi nuk u gjet' });
    return null;
  }
  if (event.organizerId !== req.user.id) {
    res.status(403).json({ error: 'Nuk ke te drejte per kete event' });
    return null;
  }
  return event;
}

async function updateEvent(req, res) {
  const event = await loadOwnedEvent(req, res);
  if (!event) return;

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: req.body,
  });

  res.json({ event: updated });
}

async function deleteEvent(req, res) {
  const event = await loadOwnedEvent(req, res);
  if (!event) return;

  await prisma.event.delete({ where: { id: event.id } });

  res.status(204).send();
}

async function myEvents(req, res) {
  const events = await prisma.event.findMany({
    where: { organizerId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { tickets: true, comments: true } } },
  });

  res.json({ events });
}

async function dashboard(req, res) {
  const event = await loadOwnedEvent(req, res);
  if (!event) return;

  const [registered, paid, checkedIn, cancelled] = await Promise.all([
    prisma.ticket.count({ where: { eventId: event.id, status: { not: 'CANCELLED' } } }),
    prisma.ticket.count({ where: { eventId: event.id, status: { in: ['PAID', 'CHECKED_IN'] } } }),
    prisma.ticket.count({ where: { eventId: event.id, status: 'CHECKED_IN' } }),
    prisma.ticket.count({ where: { eventId: event.id, status: 'CANCELLED' } }),
  ]);

  res.json({
    event: { id: event.id, title: event.title, maxAttendees: event.maxAttendees },
    stats: {
      registered,
      ticketsSold: paid,
      checkedIn,
      cancelled,
      spotsRemaining: event.maxAttendees ? Math.max(event.maxAttendees - registered, 0) : null,
    },
  });
}

async function listAttendees(req, res) {
  const event = await loadOwnedEvent(req, res);
  if (!event) return;

  const tickets = await prisma.ticket.findMany({
    where: { eventId: event.id },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: { purchasedAt: 'asc' },
  });

  res.json({ attendees: tickets });
}

async function checkInAttendee(req, res) {
  const event = await loadOwnedEvent(req, res);
  if (!event) return;

  const { ticketId } = req.params;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.eventId !== event.id) {
    return res.status(404).json({ error: 'Bileta nuk u gjet' });
  }
  if (ticket.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Bileta eshte anulluar' });
  }
  if (ticket.status === 'RESERVED') {
    return res.status(400).json({ error: 'Bileta nuk eshte konfirmuar akoma (pritet pagesa)' });
  }
  if (ticket.status === 'CHECKED_IN') {
    return res.status(400).json({ error: 'Bileta eshte check-in-uar tashme' });
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'CHECKED_IN' },
  });

  res.json({ ticket: updated });
}

module.exports = {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  myEvents,
  dashboard,
  listAttendees,
  checkInAttendee,
};
