const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello Team Wednesday 1pm!');
});

router.use('/membership', require('./membership'));
router.use('/products', require('./products'));
router.use('/customers', require('./customers'));
router.use('/sales', require('./sales'));

module.exports = router;