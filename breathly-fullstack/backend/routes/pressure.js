const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listPressureEvents, createPressureEvent, deletePressureEvent } = require('../controllers/pressureController');

router.use(requireAuth);

router.get('/', listPressureEvents);
router.post('/', createPressureEvent);
router.delete('/:id', deletePressureEvent);

module.exports = router;
