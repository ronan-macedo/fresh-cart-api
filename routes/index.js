const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello Team Wednesday 1pm!');
});

module.exports = router;