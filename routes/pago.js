const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');

router.post('/crear-orden', pagoController.crearOrden);
router.post('/capturar-orden/:ordenId', pagoController.capturarOrden);

module.exports = router;
