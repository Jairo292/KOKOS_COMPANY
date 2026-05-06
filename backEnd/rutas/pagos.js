const express = require('express');
const router = express.Router();

const pagoSchema = new mongoose.Schema({
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
  pagos_monto: {
    type: Number,
    required: true
  },
  pagos_periodo: {
    type: String,
    required: true
  },
  pagos_metodo: {
    type: String,
    required: true
  },
  pagos_estatus: {
    type: String,
    required: true
  },
  pagos_referencia: {
    type: String,
    required: true
  },
  pagos_Fvencimiento: {
    type: Date,
    required: true
  },
  pagos_date: {
    type: Date,
    default: Date.now
  }
});

const Pago = mongoose.model('Pago', pagoSchema);

router.post('/register', async (req, res) => {
  const { cliente_id, poliza_id, pagos_monto, pagos_periodo, pagos_metodo, pagos_estatus, pagos_referencia, pagos_Fvencimiento } = req.body;

  if (!cliente_id || !poliza_id || !pagos_monto || !pagos_periodo || !pagos_metodo || !pagos_estatus || !pagos_referencia || !pagos_Fvencimiento) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const nuevoPago = new Pago({
      cliente_id,
      poliza_id,
      pagos_monto,
      pagos_periodo,
      pagos_metodo,
      pagos_estatus,
      pagos_referencia,
      pagos_Fvencimiento
    });

    await nuevoPago.save();
    res.status(201).json({
      message: 'Pago registrado correctamente'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar pago' });
  }
});
