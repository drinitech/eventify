const prisma = require('../config/db');

const userSelect = { id: true, name: true, avatarUrl: true };

async function createComment(req, res) {
  const { id: eventId } = req.params;
  const userId = req.user.id;
  const { text, rating } = req.body;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return res.status(404).json({ error: 'Eventi nuk u gjet' });
  }

  if (new Date(event.date) > new Date()) {
    return res.status(400).json({ error: 'Mund te lesh review vetem pas perfundimit te eventit' });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (!ticket || ticket.status === 'CANCELLED') {
    return res.status(403).json({ error: 'Vetem pjesemarresit e regjistruar mund te lene review' });
  }

  const existing = await prisma.comment.findFirst({ where: { eventId, userId } });
  if (existing) {
    return res.status(409).json({ error: 'Ke lene tashme nje review per kete event' });
  }

  const comment = await prisma.comment.create({
    data: { eventId, userId, text, rating },
    include: { user: { select: userSelect } },
  });

  res.status(201).json({ comment });
}

async function listComments(req, res) {
  const { id: eventId } = req.params;

  const [comments, aggregate] = await Promise.all([
    prisma.comment.findMany({
      where: { eventId },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.comment.aggregate({
      where: { eventId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  res.json({
    comments,
    avgRating: aggregate._avg.rating,
    totalReviews: aggregate._count,
  });
}

async function updateComment(req, res) {
  const { id } = req.params;

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return res.status(404).json({ error: 'Komenti nuk u gjet' });
  }
  if (comment.userId !== req.user.id) {
    return res.status(403).json({ error: 'Nuk ke te drejte per kete koment' });
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: req.body,
    include: { user: { select: userSelect } },
  });

  res.json({ comment: updated });
}

async function deleteComment(req, res) {
  const { id } = req.params;

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { event: { select: { organizerId: true } } },
  });
  if (!comment) {
    return res.status(404).json({ error: 'Komenti nuk u gjet' });
  }

  const isOwner = comment.userId === req.user.id;
  const isOrganizer = comment.event.organizerId === req.user.id;
  if (!isOwner && !isOrganizer) {
    return res.status(403).json({ error: 'Nuk ke te drejte per kete koment' });
  }

  await prisma.comment.delete({ where: { id } });

  res.status(204).send();
}

module.exports = { createComment, listComments, updateComment, deleteComment };
