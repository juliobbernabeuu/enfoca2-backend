const db = require("../config/db.js");
const { enviarCorreo } = require('../utils/correoUtils.js');

// Eliminar foto
exports.eliminarFoto = (req, res) => {
  const idFoto = req.params.id;

  const sqlSelect = `
    SELECT 
      f.titulo, 
      f.url, 
      u.email, 
      u.nombre
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


// Obtener todas las fotos
exports.obtenerFotos = (req, res) => {
  db.query("SELECT * FROM fotografias", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtener foto por ID
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

const path = require('path');
const multer = require('multer');

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../enfoca2-frontend/public/galeria'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Puedes poner un hash o timestamp si quieres evitar colisiones
  }
});

const upload = multer({ storage });

// Añade este export al final del archivo para usar en la ruta
exports.upload = upload.single('archivo');

// La lógica principal
exports.subirFoto = (req, res) => {
  const { id_usuario } = req.usuario;
  const { id_categoria, titulo, descargable, localizacion_nombre, precio } = req.body;
  const url = `/galeria/${req.file.filename}`;

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



// Obtener fotos más valoradas
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
    GROUP BY 
      f.id_foto
    ORDER BY total_likes DESC, f.fecha DESC
    LIMIT 12
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

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



