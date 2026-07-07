const { z } = require('zod');

const moderateEventSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'CANCELLED']),
});

const updateRoleSchema = z.object({
  role: z.enum(['PARTICIPANT', 'ORGANIZER', 'BOTH', 'ADMIN']),
});

module.exports = { moderateEventSchema, updateRoleSchema };
