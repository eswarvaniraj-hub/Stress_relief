const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat/gemini
router.post('/gemini', chatController.chatWithGemini);

module.exports = router;
