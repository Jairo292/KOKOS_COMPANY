const express = require('express');
const router = express.Router();

const polizaSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  numeroPoliza: { type: String, required: true, unique: true },
  tipoSeguro: { type: String, required: true },
  estado: { type: String, required: true },
  primaMensual: { type: Number, required: true },
  fechaInicio: { type: Date, required: true },
  fechaVencimiento: { type: Date, required: true }
});

const Poliza = mongoose.model('Poliza', polizaSchema);

router.post('/register', async (req, res) => {
  const { cliente, numeroPoliza, tipoSeguro, estado, primaMensual, fechaInicio, fechaVencimiento } = req.body;

  if (!cliente || !numeroPoliza || !tipoSeguro || !estado || !primaMensual || !fechaInicio || !fechaVencimiento) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const existePoliza = await Poliza.findOne({ numeroPoliza });

    if (existePoliza) {
      return res.status(400).json({ message: 'Ese número de póliza ya existe' });
    }

    const nuevaPoliza = new Poliza({
      cliente,
      numeroPoliza,
      tipoSeguro,
      estado,
      primaMensual,
      fechaInicio,
      fechaVencimiento
    });

    await nuevaPoliza.save();

    res.json({ message: 'Póliza creada exitosamente' });

  } catch (err) {
    res.status(500).json({ message: 'Error al crear póliza' });
  }
});

router.get('/read', async (req, res) => {
  try {
    const polizas = await Poliza.find();
    res.json(polizas);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener pólizas' });
  }
});

router.post('/update', async (req, res) => {
  const { numeroPoliza, cliente, tipoSeguro, estado, primaMensual, fechaInicio, fechaVencimiento } = req.body;

  if (!numeroPoliza) {
    return res.status(400).json({ message: 'Número de póliza requerido' });
  }

  try {
    const poliza = await Poliza.findOne({ numeroPoliza });

    if (!poliza) {
      return res.status(400).json({ message: 'Póliza no encontrada' });
    }

    poliza.cliente = cliente;
    poliza.tipoSeguro = tipoSeguro;
    poliza.estado = estado;
    poliza.primaMensual = primaMensual;
    poliza.fechaInicio = fechaInicio;
    poliza.fechaVencimiento = fechaVencimiento;

    await poliza.save();

    res.json({ message: 'Póliza actualizada' });

  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar póliza' });
  }
});

router.post('/delete', async (req, res) => {
  const { numeroPoliza } = req.body;

  if (!numeroPoliza) {
    return res.status(400).json({ message: 'Número de póliza requerido' });
  }

  try {
    const poliza = await Poliza.findOne({ numeroPoliza });

    if (!poliza) {
      return res.status(400).json({ message: 'Póliza no existe' });
    }

    await poliza.deleteOne();

    res.json({ message: 'Póliza eliminada' });

  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar póliza' });
  }
});
