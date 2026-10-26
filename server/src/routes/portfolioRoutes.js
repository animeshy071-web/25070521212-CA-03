const router = require('express').Router();
const { getPortfolio, getHoldings, getPerformance } = require('../controllers/portfolioController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', getPortfolio);
router.get('/holdings', getHoldings);
router.get('/performance', getPerformance);

module.exports = router;
