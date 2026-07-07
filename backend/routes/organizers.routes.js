const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const organizerController = require('../controllers/organizer.controller');

const router = express.Router();

router.get('/following/mine', requireAuth, asyncHandler(organizerController.myFollowing));

router.get('/:id', asyncHandler(organizerController.getOrganizerProfile));
router.post('/:id/follow', requireAuth, asyncHandler(organizerController.followOrganizer));
router.delete('/:id/follow', requireAuth, asyncHandler(organizerController.unfollowOrganizer));

module.exports = router;
