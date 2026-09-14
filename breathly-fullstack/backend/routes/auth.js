const express = require('express');
const router = express.Router();
const { googleLogin, me, logout } = require('../controllers/authController');

router.post('/google', googleLogin);
router.get('/me', me);
router.post('/logout', logout);

module.exports = router;
