const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const puerto = process.env.PORT || 3000;

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/fotos', require('./routes/fotos.js'));
app.use('/api/comentarios', require('./routes/comentarios.js'));
app.use('/api/likes', require('./routes/likes.js'));
app.use('/api/categorias', require('./routes/categorias.js'));
app.use('/api/admin', require('./routes/admin.js'));
app.use('/api/usuarios', require('./routes/usuarios.js'));
app.use('/api/pago',require('./routes/pago'));
app.use('/api/pagos', require('./routes/pagos'));



app.listen(puerto, () => {
  console.log(`Servidor corriendo en el puerto ${puerto}`);
});
