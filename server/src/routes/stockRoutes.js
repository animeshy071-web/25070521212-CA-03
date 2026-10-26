const router = require('express').Router();
const { listStocks, searchStocks, getStock, getStockQuote, getStockHistory } = require('../controllers/stockController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', listStocks);
router.get('/search', searchStocks);
router.get('/:symbol', optionalAuth, getStock);
router.get('/:symbol/quote', getStockQuote);
router.get('/:symbol/history', getStockHistory);

module.exports = router;
