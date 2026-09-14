const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/profileController');

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);

module.exports = router;
