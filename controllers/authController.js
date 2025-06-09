const db = require("../config/db.js");
const bcrypt = require("bcryptjs");      
const jwt = require("jsonwebtoken");      
require("dotenv").config();                

exports.register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Usuario registrado con éxito" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(401).json({ error: "Incorrecto" });

      const usuario = results[0];
      const validPassword = await bcrypt.compare(password, usuario.password);
      if (!validPassword)
        return res.status(401).json({ error: "Incorrecto" });

      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          rol: usuario.rol,
          nombre: usuario.nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ mensaje: "Inicio de sesión exitoso", token }); // solo mensaje + token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
    }

  );
};
