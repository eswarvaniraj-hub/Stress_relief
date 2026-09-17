const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/distractionController');

router.use(requireAuth);
router.get('/', ctrl.listDistractions);
router.get('/summary', ctrl.getDistractionSummary);
router.post('/', ctrl.createDistraction);
router.delete('/:id', ctrl.deleteDistraction);

module.exports = router;
