const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { updateCommentSchema } = require('../validation/comment.schema');
const { asyncHandler } = require('../utils/asyncHandler');
const commentController = require('../controllers/comment.controller');

const router = express.Router();

router.put('/:id', requireAuth, validate(updateCommentSchema), asyncHandler(commentController.updateComment));
router.delete('/:id', requireAuth, asyncHandler(commentController.deleteComment));

module.exports = router;
