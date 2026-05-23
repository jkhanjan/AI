const express = require('express');

const {
  createChat,
  getChats,
  getChatById,
  addMessage,
  getMessages
} = require('../controllers/savechat.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.post('/chat', createChat);
router.get('/chat', getChats);
router.get('/chat/:id', getChatById);

router.post('/chat/:id/message', addMessage);
router.get('/chat/:id/messages', getMessages);

module.exports = router;