const router = require('express').Router();
const { buy, sell, listTrades, getTrade } = require('../controllers/tradeController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.post('/buy', buy);
router.post('/sell', sell);
router.get('/', listTrades);
router.get('/:tradeId', getTrade);

module.exports = router;
