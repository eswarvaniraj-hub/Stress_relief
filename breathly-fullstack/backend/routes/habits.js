const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listHabits, createHabit, updateHabit, deleteHabit, logHabitFailure, listFailures } = require('../controllers/habitController');

router.use(requireAuth);

router.get('/', listHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/failure', logHabitFailure);
router.get('/failures', listFailures);

module.exports = router;
