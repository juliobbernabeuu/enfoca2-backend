const express = require('express');
const router = express.Router();
const fotosController = require('../controllers/fotosController.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

router.get('/valoradas', fotosController.obtenerFotosValoradas);
router.get('/filtrar', fotosController.filtrarFotos);
router.post('/', verificarToken, fotosController.upload, fotosController.subirFoto);
router.get('/detalle/:id', fotosController.obtenerFotoDetalle);
router.get('/', fotosController.obtenerFotos);
router.get('/:id', fotosController.obtenerFotoPorId);
router.delete('/:id', verificarToken, fotosController.eliminarFoto);

// NUEVAS RUTAS
router.put('/:id', verificarToken, fotosController.editarFoto); // editar foto
router.get('/usuario/mis-fotos', verificarToken, fotosController.obtenerFotosUsuario); // fotos del usuario

module.exports = router;
