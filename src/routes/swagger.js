const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = process.env.NODE_ENV === 'development' ?
    require('../../swagger-local.json') : require('../../swagger.json');

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = router;