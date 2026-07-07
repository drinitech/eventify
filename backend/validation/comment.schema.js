const { z } = require('zod');

const createCommentSchema = z.object({
  text: z.string().min(1).max(2000),
  rating: z.coerce.number().int().min(1).max(5),
});

const updateCommentSchema = createCommentSchema.partial();

module.exports = { createCommentSchema, updateCommentSchema };
