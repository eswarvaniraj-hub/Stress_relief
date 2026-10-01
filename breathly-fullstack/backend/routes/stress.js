const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/stressController');

router.use(requireAuth);

router.get('/', ctrl.listRecords);
router.post('/', ctrl.createRecord);
router.get('/current', ctrl.getCurrentStress);
router.get('/trend', ctrl.getStressTrend);
router.post('/predict', ctrl.predictStress);

module.exports = router;
