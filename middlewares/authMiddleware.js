const db = require("../config/db.js");
const jwt = require("jsonwebtoken");

exports.verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1]; // ← aquí el fix
  if (!token) return res.status(403).json({ error: 'Token mal formado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;

    // Si es admin, permitir
    if (decoded.rol === 'admin') {
      return next();
    }

    // Si no es admin, verificar bloqueo
    db.query('SELECT bloqueado_hasta FROM usuarios WHERE id_usuario = ?', [decoded.id_usuario], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al verificar el estado del usuario' });

      const bloqueadoHasta = results[0]?.bloqueado_hasta;
      if (bloqueadoHasta && new Date(bloqueadoHasta) > new Date()) {
        const fecha = new Date(bloqueadoHasta).toLocaleDateString('es-ES');
        return res.status(403).json({ error: `Tu acceso está bloqueado hasta el ${fecha}` });
      }

      next();
    });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
