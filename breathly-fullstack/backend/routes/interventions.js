const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/interventionController');

router.use(requireAuth);

router.get('/recommendations', ctrl.getRecommendations);
router.post('/start', ctrl.startIntervention);
router.post('/complete', ctrl.completeIntervention);
router.get('/history', ctrl.listInterventionHistory);
router.get('/effectiveness', ctrl.getEffectiveness);

module.exports = router;
