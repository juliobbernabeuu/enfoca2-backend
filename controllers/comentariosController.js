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

  db.query(
    `SELECT c.*, f.titulo AS titulo_foto 
     FROM comentarios c 
     JOIN fotos f ON c.id_foto = f.id_foto 
     WHERE c.id_usuario = ? 
     ORDER BY c.fecha DESC`,
    [id_usuario],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};
