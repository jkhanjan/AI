// routes/ai.routes.js
const express = require('express');
const router = express.Router();

const { chat } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/chat',protect, chat);

module.exports = router;