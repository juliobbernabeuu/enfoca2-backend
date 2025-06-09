const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const { enviarCorreo } = require('../utils/correoUtils.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

// Obtener usuarios (sin admin) — requiere token válido
router.get('/',verificarToken, (req, res) => {
        console.log(req.usuario.rol);
  db.query('SELECT id_usuario, nombre, email,rol,bloqueado_hasta FROM usuarios WHERE rol != "admin"', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Endpoint para bloquear usuario (requiere autenticación y rol admin)
router.post('/:id/bloquear',verificarToken, (req, res) => {

  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo los administradores pueden bloquear usuarios.' });
  }

  const { id } = req.params;
  const { dias } = req.body;

  const fechaBloqueo = new Date();
  fechaBloqueo.setDate(fechaBloqueo.getDate() + dias);

  db.query('UPDATE usuarios SET bloqueado_hasta = ? WHERE id_usuario = ?', [fechaBloqueo, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('SELECT email, nombre FROM usuarios WHERE id_usuario = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

      const { email, nombre } = results[0];
      const nombreMostrado = nombre || 'usuario';
      const fechaFormateada = fechaBloqueo.toLocaleDateString('es-ES');

      const asunto = 'Acceso temporalmente bloqueado – Enfoca2';
      const mensaje = `Hola ${nombreMostrado},\n\nTu cuenta ha sido bloqueada temporalmente por ${dias} día(s).\nPodrás volver a acceder a partir del día ${fechaFormateada}.\n\nGracias por tu comprensión.\n\nEquipo de Enfoca2.`;

      enviarCorreo(email, asunto, mensaje);

      res.json({ mensaje: 'Usuario bloqueado y notificado por correo.' });
    });
  });
});

module.exports = router;
