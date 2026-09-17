const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/focusSessionController');

router.use(requireAuth);
router.get('/', ctrl.listFocusSessions);
router.post('/', ctrl.createFocusSession);
router.delete('/:id', ctrl.deleteFocusSession);

module.exports = router;
