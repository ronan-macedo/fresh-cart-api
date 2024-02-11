const router = require('express').Router();

router.use('/', require('./swagger'));
router.use('/health', require('./healthcheck'));
router.use('/membership', require('./membership'));
router.use('/products', require('./products'));
router.use('/customers', require('./customers'));
router.use('/sales', require('./sales'));
router.get('/', (req, res) => {    
    res.redirect(process.env.BASE_URL + '/api-docs');
});
router.get('/callback', (req, res) => {    
    res.redirect(process.env.BASE_URL + '/api-docs');
});

module.exports = router;