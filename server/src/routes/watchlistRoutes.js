const router = require('express').Router();
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:stockId', removeFromWatchlist);

module.exports = router;
