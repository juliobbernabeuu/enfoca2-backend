const db = require("../config/db.js");
const { enviarCorreo } = require('../utils/correoUtils.js');
const path = require('path');
const multer = require('multer');

// ✅ Configuración de multer (directorio válido para Render)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Carpeta válida en el backend
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Puedes usar un nombre único si lo deseas
  }
});

const upload = multer({ storage });

// Exportar middleware de subida
exports.upload = upload.single('archivo');

// ✅ Subida de foto
exports.subirFoto = (req, res) => {
  const { id_usuario } = req.usuario;
  const { id_categoria, titulo, descargable, localizacion_nombre, precio } = req.body;
  const url = `/galeria/${req.file.filename}`; // URL accesible desde frontend

  db.query(
    `INSERT INTO fotografias 
     (id_usuario, id_categoria, titulo, url, descargable, localizacion_nombre, precio)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_usuario, id_categoria, titulo, url, descargable, localizacion_nombre, precio],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Foto subida con éxito" });
    }
  );
};

// ✅ Eliminar foto y enviar correo
exports.eliminarFoto = (req, res) => {
  const idFoto = req.params.id;

  const sqlSelect = `
    SELECT 
      f.titulo, 
      f.url, 
      u.email, 
      u.nombre AS nombre_usuario
    FROM fotografias f
    JOIN usuarios u ON f.id_usuario = u.id_usuario
    WHERE f.id_foto = ?
  `;

  db.query(sqlSelect, [idFoto], (err, result) => {
    if (err) {
      console.error('Error al obtener la foto:', err);
      return res.status(500).json({ error: 'Error al obtener la foto' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    const { email, nombre_usuario, titulo } = result[0];

    const sqlDelete = 'DELETE FROM fotografias WHERE id_foto = ?';

    db.query(sqlDelete, [idFoto], (err2) => {
      if (err2) {
        console.error('Error al eliminar la foto:', err2);
        return res.status(500).json({ error: 'Error al eliminar la foto' });
      }

      // Enviar correo de notificación
      enviarCorreo(
        email,
        'Tu foto ha sido eliminada',
        `Hola ${nombre_usuario},\n\nTu foto titulada "${titulo}" ha sido eliminada por infringir las normas del sitio.\n\nSaludos.`
      );

      return res.json({ mensaje: 'Foto eliminada correctamente' });
    });
  });
};

// ✅ Obtener todas las fotos
exports.obtenerFotos = (req, res) => {
  db.query("SELECT * FROM fotografias", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ✅ Obtener foto por ID
exports.obtenerFotoPorId = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM fotografias WHERE id_foto = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0)
        return res.status(404).json({ error: "Foto no encontrada" });
      res.json(result[0]);
    }
  );
};

// ✅ Obtener fotos más valoradas
exports.obtenerFotosValoradas = (req, res) => {
  const sql = `
    SELECT 
      f.id_foto,
      f.id_usuario,
      f.id_categoria,
      f.titulo,
      f.url,
      f.descargable,
      f.precio,
      f.fecha,
      f.localizacion_nombre,
      COUNT(l.id_like) AS total_likes
    FROM fotografias f
    LEFT JOIN likes l ON f.id_foto = l.id_foto
    GROUP BY f.id_foto
    ORDER BY total_likes DESC, f.fecha DESC
    LIMIT 12
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ✅ Filtrar fotos
exports.filtrarFotos = (req, res) => {
  const { categoria, usuario, titulo, orden, precio } = req.query;

  let baseQuery = `
    SELECT 
      f.*, 
      u.nombre AS nombre_usuario, 
      COUNT(l.id_like) AS total_likes
    FROM fotografias f
    JOIN usuarios u ON f.id_usuario = u.id_usuario
    LEFT JOIN likes l ON f.id_foto = l.id_foto
    WHERE 1=1
  `;

  const params = [];

  if (categoria) {
    baseQuery += ' AND f.id_categoria = ?';
    params.push(categoria);
  }

  if (usuario) {
    baseQuery += ' AND f.id_usuario = ?';
    params.push(usuario);
  }

  if (titulo) {
    baseQuery += ' AND f.titulo LIKE ?';
    params.push(`%${titulo}%`);
  }

  if (precio === 'gratis') {
    baseQuery += ' AND (f.precio IS NULL OR f.precio = 0)';
  } else if (precio === 'pago') {
    baseQuery += ' AND f.precio > 0';
  }

  baseQuery += ' GROUP BY f.id_foto';

  if (orden === 'fecha') {
    baseQuery += ' ORDER BY f.fecha DESC';
  } else if (orden === 'likes') {
    baseQuery += ' ORDER BY total_likes DESC';
  } else {
    baseQuery += ' ORDER BY f.fecha DESC';
  }

  db.query(baseQuery, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ✅ Detalle de una foto
exports.obtenerFotoDetalle = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      f.id_foto,
      f.titulo,
      f.url,
      f.descargable,
      f.precio,
      f.fecha,
      f.localizacion_nombre,
      u.nombre AS nombre_usuario,
      u.email
    FROM fotografias f
    JOIN usuarios u ON f.id_usuario = u.id_usuario
    WHERE f.id_foto = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: "Foto no encontrada" });
    res.json(result[0]);
  });
};
// Actualizar foto (sin cambiar la imagen)
exports.editarFoto = (req, res) => {
  const idFoto = req.params.id;
  const { id_usuario } = req.usuario; // Aseguramos que el usuario sea el dueño
  const { id_categoria, titulo, descargable, localizacion_nombre, precio } = req.body;

  // Verificamos que la foto pertenece al usuario
  db.query(
    "SELECT id_usuario FROM fotografias WHERE id_foto = ?",
    [idFoto],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ error: "Foto no encontrada" });

      if (result[0].id_usuario !== id_usuario) {
        return res.status(403).json({ error: "No autorizado para editar esta foto" });
      }

      // Actualizar datos
      db.query(
        `UPDATE fotografias SET
          id_categoria = ?,
          titulo = ?,
          descargable = ?,
          localizacion_nombre = ?,
          precio = ?
        WHERE id_foto = ?`,
        [id_categoria, titulo, descargable, localizacion_nombre, precio, idFoto],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ mensaje: "Foto actualizada correctamente" });
        }
      );
    }
  );
};

exports.obtenerFotosUsuario = (req, res) => {
  const { id_usuario } = req.usuario; // del token

  db.query(
    "SELECT * FROM fotografias WHERE id_usuario = ?",
    [id_usuario],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

