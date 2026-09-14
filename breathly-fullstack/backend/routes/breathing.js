const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/breathingController');

router.use(requireAuth);
router.get('/sessions', ctrl.listSessions);
router.post('/sessions', ctrl.createSession);

module.exports = router;
