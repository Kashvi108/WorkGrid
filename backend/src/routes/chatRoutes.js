const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getChatRoom,
  getMessages,
  sendMessage,
  markAsRead,
  markAllAsRead,
  editMessage,
  deleteMessage
} = require('../controllers/chatController');

// ✅ All routes require authentication
router.use(protect);


router.get('/room/:projectId', getChatRoom);

// Get all messages in a chat room (paginated)
router.get('/messages/:chatRoomId', getMessages);

// Send a new message
router.post('/messages', sendMessage);



// Mark a single message as read
router.put('/messages/:messageId/read', markAsRead);

// Mark all messages in a room as read
router.put('/messages/:chatRoomId/read-all', markAllAsRead);

// Edit a message
router.put('/messages/:messageId', editMessage);

// Delete a message (soft delete)
router.delete('/messages/:messageId', deleteMessage);

module.exports = router;