const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/preferencesController');

router.use(requireAuth);
router.get('/', ctrl.getPreferences);
router.put('/', ctrl.updatePreferences);

module.exports = router;
