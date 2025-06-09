const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/comentariosController.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

router.post('/:id_foto', verificarToken, comentariosController.comentarFoto);
router.get('/:id_foto', comentariosController.obtenerComentarios);

module.exports = router;
