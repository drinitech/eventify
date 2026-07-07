const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const ticketController = require('../controllers/ticket.controller');

const router = express.Router();

router.get('/mine', requireAuth, asyncHandler(ticketController.myTickets));
router.get('/:id', requireAuth, asyncHandler(ticketController.getTicket));
router.get('/:id/qrcode', requireAuth, asyncHandler(ticketController.getTicketQr));

module.exports = router;
