const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likesController.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

router.get('/verificar/:id_foto', verificarToken, likesController.usuarioDioLike);
router.post('/:id_foto', verificarToken, likesController.darLike);
router.delete('/:id_foto', verificarToken, likesController.quitarLike);
router.get('/:id_foto', likesController.obtenerLikes);

module.exports = router;
