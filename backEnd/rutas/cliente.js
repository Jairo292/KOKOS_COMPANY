const express = require('express');
const router = express.Router();

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  fechaRegistro: { type: Date, default: Date.now }
});

const Cliente = mongoose.model('Cliente', clienteSchema);

router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, telefono } = req.body;
    const cliente = new Cliente({ nombre, correo, telefono });
    await cliente.save();
    res.status(201).json({ message: 'Cliente creado', cliente });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear cliente', error: error.message });
  }
});

router.get('/read', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
});

router.post('/update', async (req, res) => {
  const { correo, nombre, telefono } = req.body;

  if (!correo) {
    return res.status(400).json({ message: 'Correo requerido' });
  }

  try {
    const cliente = await Cliente.findOne({ correo });

    if (!cliente) {
      return res.status(400).json({ message: 'Cliente no encontrado' });
    }

    cliente.nombre = nombre;
    cliente.telefono = telefono;

    await cliente.save();

    res.json({ message: 'Cliente actualizado', cliente });

  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
});;

router.post('/delete', async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ message: 'Correo requerido' });
  }

  try {
    const cliente = await Cliente.findOne({ correo });

    if (!cliente) {
      return res.status(400).json({ message: 'Cliente no existe' });
    }

    await cliente.deleteOne();

    res.json({ message: 'Cliente eliminado' });

  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
});