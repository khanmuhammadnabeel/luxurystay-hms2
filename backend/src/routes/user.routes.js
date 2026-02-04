const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getCurrentUser, updateProfile } = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.get('/me', getCurrentUser);
router.put('/profile', updateProfile);

module.exports = router;