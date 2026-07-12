const express = require('express');

const {
  createChat,
  getChats,
  getChatById,
  getMessages,
  addMessageStream 
} = require('../controllers/savechat.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.post('/chat', createChat); 
router.get('/chat', getChats);
router.get('/chat/:id', getChatById);

// router.post('/chat/:id/message', addMessage);
router.post('/chat/:id/message/stream', addMessageStream);
router.get('/chat/:id/messages', getMessages);

module.exports = router;