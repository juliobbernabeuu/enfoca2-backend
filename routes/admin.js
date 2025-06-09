const express = require('express');
const router = express.Router();
const db = require('../config/db.js');

// Obtener todos los usuarios
router.get('/usuarios', (req, res) => {
  db.query('SELECT id_usuario, nombre, email FROM usuarios WHERE rol != "admin"', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Eliminar usuario
router.delete('/usuarios/:id', (req, res) => {
  db.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Usuario eliminado' });
  });
});

// Obtener fotos
router.get('/fotos', (req, res) => {
  db.query('SELECT id_foto, url FROM fotografias', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Eliminar foto
router.delete('/fotos/:id', (req, res) => {
  db.query('DELETE FROM fotografias WHERE id_foto = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Foto eliminada' });
  });
});

module.exports = router;
