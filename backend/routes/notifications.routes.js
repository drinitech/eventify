const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

router.get('/mine', requireAuth, asyncHandler(notificationController.myNotifications));
router.patch('/read-all', requireAuth, asyncHandler(notificationController.markAllRead));
router.patch('/:id/read', requireAuth, asyncHandler(notificationController.markRead));

module.exports = router;
