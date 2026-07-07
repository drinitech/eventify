const { z } = require('zod');

const broadcastSchema = z.object({
  message: z.string().min(1).max(1000),
});

module.exports = { broadcastSchema };
