const db = require("../config/db.js");

exports.darLike = (req, res) => {
  const { id_usuario } = req.usuario;
  const { id_foto } = req.params;

  db.query(
    "INSERT IGNORE INTO likes (id_usuario, id_foto) VALUES (?, ?)",
    [id_usuario, id_foto],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Like añadido" });
    }
  );
};

exports.quitarLike = (req, res) => {
  const { id_usuario } = req.usuario;
  const { id_foto } = req.params;

  db.query(
    "DELETE FROM likes WHERE id_usuario = ? AND id_foto = ?",
    [id_usuario, id_foto],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Like eliminado" });
    }
  );
};

exports.obtenerLikes = (req, res) => {
  const { id_foto } = req.params;

  db.query(
    "SELECT COUNT(*) AS total FROM likes WHERE id_foto = ?",
    [id_foto],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ total: result[0].total });
    }
  );
};

exports.usuarioDioLike = (req, res) => {
  const { id_usuario } = req.usuario;
  const { id_foto } = req.params;

  db.query(
    "SELECT * FROM likes WHERE id_usuario = ? AND id_foto = ?",
    [id_usuario, id_foto],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      const dioLike = result.length > 0;
      res.json({ dioLike });
    }
  );
};
