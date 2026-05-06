const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const clienteRoutes = require('./rutas/cliente');
const documentoRoutes = require('./rutas/documento');
const usuarioRoutes = require('./rutas/usuario');
const polizaRoutes = require('./rutas/poliza');
const pagoRoutes = require('./rutas/pagos');
const inmuebleRoutes = require('./rutas/inmueble');

app.use('/api/clientes', clienteRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/polizas', polizaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/inmuebles', inmuebleRoutes);
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a Mongo KOKOS'))
  .catch((err) => console.error('Error de conexion:', err));

app.listen(PORT, () => {
  console.log(`VAMOOOOS Servidor KOKOS corriendo en puerto ${PORT}`);
});

