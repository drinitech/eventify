const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/optionalAuth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createEventSchema, updateEventSchema, listEventsQuerySchema } = require('../validation/event.schema');
const { checkInQrSchema } = require('../validation/ticket.schema');
const { asyncHandler } = require('../utils/asyncHandler');
const eventController = require('../controllers/event.controller');
const ticketController = require('../controllers/ticket.controller');

const router = express.Router();

router.get('/', validate(listEventsQuerySchema, 'query'), asyncHandler(eventController.listEvents));
router.get('/mine', requireAuth, asyncHandler(eventController.myEvents));
router.post('/', requireAuth, validate(createEventSchema), asyncHandler(eventController.createEvent));

router.get('/:id', optionalAuth, asyncHandler(eventController.getEvent));
router.put('/:id', requireAuth, validate(updateEventSchema), asyncHandler(eventController.updateEvent));
router.delete('/:id', requireAuth, asyncHandler(eventController.deleteEvent));

router.get('/:id/dashboard', requireAuth, asyncHandler(eventController.dashboard));
router.get('/:id/attendees', requireAuth, asyncHandler(eventController.listAttendees));
router.patch('/:id/attendees/:ticketId/checkin', requireAuth, asyncHandler(eventController.checkInAttendee));

router.post('/:id/rsvp', requireAuth, asyncHandler(ticketController.rsvp));
router.delete('/:id/rsvp', requireAuth, asyncHandler(ticketController.cancelRsvp));
router.post('/:id/checkin-qr', requireAuth, validate(checkInQrSchema), asyncHandler(ticketController.checkInByQr));

module.exports = router;
