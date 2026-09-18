const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/gamesController');

// All game endpoints require authentication.
// req.userId is securely sourced from server-side session.
router.use(requireAuth);

router.get('/sessions', ctrl.listSessions);
router.post('/sessions', ctrl.createSession);
router.get('/summary', ctrl.getSummary);

module.exports = router;
