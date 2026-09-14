const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listGoals, createGoal, deleteGoal } = require('../controllers/goalController');

router.use(requireAuth);

router.get('/', listGoals);
router.post('/', createGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
