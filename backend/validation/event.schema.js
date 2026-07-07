const { z } = require('zod');

const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  date: z.coerce.date(),
  location: z.string().min(3).max(300),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  category: z.string().min(2).max(100),
  price: z.coerce.number().min(0).default(0),
  maxAttendees: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
});

const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'CANCELLED']).optional(),
});

const listEventsQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

module.exports = { createEventSchema, updateEventSchema, listEventsQuerySchema };
