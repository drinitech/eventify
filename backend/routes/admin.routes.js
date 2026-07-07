const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/requireAdmin.middleware');
const { validate } = require('../middleware/validation.middleware');
const { moderateEventSchema, updateRoleSchema } = require('../validation/admin.schema');
const { asyncHandler } = require('../utils/asyncHandler');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', asyncHandler(adminController.getStats));

router.get('/events', asyncHandler(adminController.listEvents));
router.patch('/events/:id/status', validate(moderateEventSchema), asyncHandler(adminController.moderateEvent));

router.get('/users', asyncHandler(adminController.listUsers));
router.patch('/users/:id/role', validate(updateRoleSchema), asyncHandler(adminController.updateUserRole));
router.delete('/users/:id', asyncHandler(adminController.deleteUser));

module.exports = router;
