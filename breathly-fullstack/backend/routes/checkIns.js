const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  createCheckIn,
  getCheckInStatus,
  getRecentCheckIns
} = require('../controllers/checkInController');

router.use(requireAuth);

router.post('/', createCheckIn);
router.get('/status', getCheckInStatus);
router.get('/recent', getRecentCheckIns);

module.exports = router;
