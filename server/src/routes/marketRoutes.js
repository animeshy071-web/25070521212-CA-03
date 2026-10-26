const router = require('express').Router();
const { getOverview, getMovers, getNews } = require('../controllers/marketController');

router.get('/overview', getOverview);
router.get('/movers', getMovers);
router.get('/news', getNews);

module.exports = router;
