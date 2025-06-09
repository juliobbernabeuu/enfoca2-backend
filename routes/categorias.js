const express = require('express');
const router = express.Router();
const db = require('../config/db.js');

// Ruta original: devuelve todas las categorías
router.get('/', (req, res) => {
  db.query("SELECT * FROM categorias", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
