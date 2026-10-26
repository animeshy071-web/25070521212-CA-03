const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/me', getProfile);
router.patch('/me', updateProfile);

module.exports = router;
