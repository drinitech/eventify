const crypto = require('crypto');
const prisma = require('../config/db');
const { signQrToken, verifyQrToken, renderQrDataUrl } = require('../utils/qrcode');

const eventSummarySelect = {
  id: true,
  title: true,
  date: true,
  location: true,
  imageUrl: true,
  price: true,
  status: true,
  organizerId: true,
};

async function rsvp(req, res) {
  const { id: eventId } = req.params;
  const userId = req.user.id;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.status !== 'PUBLISHED') {
    return res.status(404).json({ error: 'Eventi nuk u gjet' });
  }
  if (event.organizerId === userId) {
    return res.status(400).json({ error: 'Nuk mund te besh RSVP ne eventin qe organizon vete' });
  }
  if (new Date(event.date) < new Date()) {
    return res.status(400).json({ error: 'Eventi ka perfunduar tashme' });
  }

  const existing = await prisma.ticket.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  if (existing && existing.status !== 'CANCELLED') {
    return res.status(409).json({ error: 'Ke bere RSVP tashme per kete event' });
  }

  if (event.maxAttendees) {
    const registeredCount = await prisma.ticket.count({
      where: { eventId, status: { not: 'CANCELLED' } },
    });
    if (registeredCount >= event.maxAttendees) {
      return res.status(400).json({ error: 'Eventi ka arritur numrin maksimal te pjesemarresve' });
    }
  }

  const isFree = Number(event.price) === 0;
  const status = isFree ? 'PAID' : 'RESERVED';

  let ticket;
  if (existing) {
    ticket = await prisma.ticket.update({
      where: { id: existing.id },
      data: { status, purchasedAt: new Date() },
    });
  } else {
    const ticketId = crypto.randomUUID();
    const qrCode = signQrToken(ticketId);
    ticket = await prisma.ticket.create({
      data: { id: ticketId, eventId, userId, status, qrCode },
    });
  }

  res.status(201).json({ ticket, requiresPayment: !isFree });
}

async function cancelRsvp(req, res) {
  const { id: eventId } = req.params;
  const userId = req.user.id;

  const ticket = await prisma.ticket.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  if (!ticket || ticket.status === 'CANCELLED') {
    return res.status(404).json({ error: 'Nuk ke nje RSVP aktiv per kete event' });
  }

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: 'CANCELLED' },
  });

  res.json({ ticket: updated });
}

async function myTickets(req, res) {
  const tickets = await prisma.ticket.findMany({
    where: { userId: req.user.id },
    include: { event: { select: eventSummarySelect } },
    orderBy: { purchasedAt: 'desc' },
  });

  res.json({ tickets });
}

async function getTicket(req, res) {
  const { id } = req.params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { event: { select: eventSummarySelect } },
  });

  if (!ticket) {
    return res.status(404).json({ error: 'Bileta nuk u gjet' });
  }

  const isOwner = ticket.userId === req.user.id;
  const isOrganizer = ticket.event.organizerId === req.user.id;
  if (!isOwner && !isOrganizer) {
    return res.status(403).json({ error: 'Nuk ke te drejte per kete bilete' });
  }

  res.json({ ticket });
}

async function getTicketQr(req, res) {
  const { id } = req.params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { event: { select: eventSummarySelect } },
  });

  if (!ticket) {
    return res.status(404).json({ error: 'Bileta nuk u gjet' });
  }

  const isOwner = ticket.userId === req.user.id;
  const isOrganizer = ticket.event.organizerId === req.user.id;
  if (!isOwner && !isOrganizer) {
    return res.status(403).json({ error: 'Nuk ke te drejte per kete bilete' });
  }

  const qrImage = await renderQrDataUrl(ticket.qrCode);
  res.json({ qrImage });
}

async function checkInByQr(req, res) {
  const { id: eventId } = req.params;
  const { qrCode } = req.body;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return res.status(404).json({ error: 'Eventi nuk u gjet' });
  }
  if (event.organizerId !== req.user.id) {
    return res.status(403).json({ error: 'Nuk ke te drejte per kete event' });
  }

  let payload;
  try {
    payload = verifyQrToken(qrCode);
  } catch (err) {
    return res.status(400).json({ error: 'QR kod i pavlefshem' });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: payload.ticketId } });
  if (!ticket || ticket.eventId !== eventId || ticket.qrCode !== qrCode) {
    return res.status(404).json({ error: 'Bileta nuk u gjet per kete event' });
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
    where: { id: ticket.id },
    data: { status: 'CHECKED_IN' },
  });

  res.json({ ticket: updated });
}

module.exports = {
  rsvp,
  cancelRsvp,
  myTickets,
  getTicket,
  getTicketQr,
  checkInByQr,
};
