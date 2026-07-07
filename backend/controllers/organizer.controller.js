const prisma = require('../config/db');

const organizerProfileSelect = { id: true, name: true, avatarUrl: true, bio: true, createdAt: true };

async function getOrganizerProfile(req, res) {
  const { id } = req.params;

  const organizer = await prisma.user.findUnique({
    where: { id },
    select: organizerProfileSelect,
  });
  if (!organizer) {
    return res.status(404).json({ error: 'Organizatori nuk u gjet' });
  }

  const [followersCount, events] = await Promise.all([
    prisma.follow.count({ where: { organizerId: id } }),
    prisma.event.findMany({
      where: { organizerId: id, status: 'PUBLISHED' },
      orderBy: { date: 'asc' },
    }),
  ]);

  res.json({ organizer, followersCount, events });
}

async function followOrganizer(req, res) {
  const { id: organizerId } = req.params;
  const followerId = req.user.id;

  if (organizerId === followerId) {
    return res.status(400).json({ error: 'Nuk mund te ndjekesh veten' });
  }

  const organizer = await prisma.user.findUnique({ where: { id: organizerId } });
  if (!organizer) {
    return res.status(404).json({ error: 'Organizatori nuk u gjet' });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_organizerId: { followerId, organizerId } },
  });
  if (existing) {
    return res.status(409).json({ error: 'Ndjek tashme kete organizator' });
  }

  const follow = await prisma.follow.create({ data: { followerId, organizerId } });

  res.status(201).json({ follow });
}

async function unfollowOrganizer(req, res) {
  const { id: organizerId } = req.params;
  const followerId = req.user.id;

  const existing = await prisma.follow.findUnique({
    where: { followerId_organizerId: { followerId, organizerId } },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Nuk e ndjek kete organizator' });
  }

  await prisma.follow.delete({ where: { id: existing.id } });

  res.status(204).send();
}

async function myFollowing(req, res) {
  const follows = await prisma.follow.findMany({
    where: { followerId: req.user.id },
    include: { organizer: { select: organizerProfileSelect } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ following: follows.map((f) => f.organizer) });
}

module.exports = { getOrganizerProfile, followOrganizer, unfollowOrganizer, myFollowing };
