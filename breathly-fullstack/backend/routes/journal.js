const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/journalController');

router.use(requireAuth);
router.get('/', ctrl.listEntries);
router.post('/', ctrl.createEntry);
router.put('/:id', ctrl.updateEntry);
router.delete('/:id', ctrl.deleteEntry);

module.exports = router;
