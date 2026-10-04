const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listHabits, createHabit, updateHabit, completeHabit, deleteHabit, logHabitFailure, listFailures } = require('../controllers/habitController');

router.use(requireAuth);

router.get('/', listHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.post('/:id/complete', completeHabit);
router.delete('/:id', deleteHabit);
router.post('/failure', logHabitFailure);
router.get('/failures', listFailures);

module.exports = router;
