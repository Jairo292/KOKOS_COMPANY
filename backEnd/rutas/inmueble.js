const express = require('express');
const router = express.Router();

const inmuebleSchema = new mongoose.Schema({

  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  poliza_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poliza',
    required: true
  },
  inmueble_tipo: {
    type: String,
    required: true
  },
  inmueble_valor: {
    type: Number,
    required: true
  },
  inmueble_date: {
    type: Date,
    default: Date.now
  }
});

const Inmueble = mongoose.model('Inmueble', inmuebleSchema);

router.post('/register', async (req, res) => {
  const { cliente_id, poliza_id, inmueble_tipo, inmueble_valor } = req.body;

  if (!cliente_id || !poliza_id || !inmueble_tipo || !inmueble_valor) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const nuevoInmueble = new Inmueble({
      cliente_id,
      poliza_id,
      inmueble_tipo,
      inmueble_valor
    });

    await nuevoInmueble.save();

    res.status(201).json({
      message: 'Inmueble guardado correctamente'
    });

  } catch (err) {
    res.status(500).json({ message: 'Error al crear póliza' });
  }
});