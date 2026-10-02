const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification
} = require('../controllers/notificationController');

router.use(protect);

// Get notifications for current employee
router.get('/', getNotifications);

// Static route must come before /:notificationId routes
router.put('/read-all', markAllAsRead);

// Mark a notification as read
router.put('/:notificationId/read', markAsRead);

// Dismiss a notification
router.put('/:notificationId/dismiss', dismissNotification);

module.exports = router;

