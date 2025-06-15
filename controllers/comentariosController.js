const db = require("../config/db.js");

exports.comentarFoto = (req, res) => {
  const { id_usuario } = req.usuario;
  const { id_foto } = req.params;
  const { contenido } = req.body;

  db.query(
    "INSERT INTO comentarios (id_usuario, id_foto, contenido) VALUES (?, ?, ?)",
    [id_usuario, id_foto, contenido],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Comentario añadido" });
    }
  );
};

exports.obtenerComentarios = (req, res) => {
  const { id_foto } = req.params;
  db.query(
    "SELECT c.*, u.nombre FROM comentarios c JOIN usuarios u ON c.id_usuario = u.id_usuario WHERE id_foto = ? ORDER BY fecha DESC",
    [id_foto],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

exports.obtenerComentariosPorUsuario = (req, res) => {
  const { id_usuario } = req.params;

  // Validación básica
  if (!id_usuario || isNaN(id_usuario)) {
    return res.status(400).json({ error: 'ID de usuario no válido.' });
  }

  db.query(
    `SELECT id_comentario, id_foto, contenido, fecha
     FROM comentarios
     WHERE id_usuario = ?
     ORDER BY fecha DESC`,
    [id_usuario],
    (err, results) => {
      if (err) {
        console.error('Error al obtener comentarios por usuario:', err); // Log útil
        return res.status(500).json({ error: 'Error al obtener comentarios del usuario.' });
      }

      res.json(results || []);
    }
  );
};


