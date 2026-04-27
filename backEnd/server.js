const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const multer = require('multer');
const path = require('path');
const Documento = require('./models/Documento');
require('dotenv').config(); 

const app = express(); 

app.use(cors());  
app.use(express.json());  
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;  
const MONGO_URI = process.env.MONGO_URI; 
const JWT_SECRET = process.env.JWT_SECRET; 

mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado a Mongo KOKOS'))
    .catch((err) => console.error('Error de conexion:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true }, 
    email: {  
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email no válido']
    },
    password: {  
        type: String,
        required: true,
        select: false
    }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt);
});

const Usuario = mongoose.model('Usuario', userSchema);

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;


        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        const existingUser = await Usuario.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Este correo ya está registrado' });
        }

        const newuser = new Usuario({ username, email, password });
        await newuser.save();

        res.status(201).json({ message: '¡Cuenta creada con éxito!' });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña requeridos' });
        }

        const user = await Usuario.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'El usuario no existe' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });

        res.json({
            message: 'Bienvenido a KOKOS',
            user: { id: user._id, username: user.username, email: user.email },
            token
        });

    } catch (error) {
        res.status(500).json({ message: 'Error en el login', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`VAMOOOOS Servidor KOKOS corriendo en puerto ${PORT}`);
});

const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    fechaRegistro: { type: Date, default: Date.now }
});

const Cliente = mongoose.model('Cliente', clienteSchema);

app.post('/api/clientes', async (req, res) => {
    try {
        const { nombre, correo, telefono } = req.body;
        const cliente = new Cliente({ nombre, correo, telefono });
        await cliente.save();
        res.status(201).json({ message: 'Cliente creado', cliente });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear cliente', error: error.message });
    }
});

app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
    }
});

app.post('/api/clientes/update', async (req, res) => {
    const { email, nombreCompleto, telefono } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email requerido' });
    }

    try {
        const cliente = await Cliente.findOne({ email });

        if (!cliente) {
            return res.status(400).json({ message: 'Cliente no encontrado' });
        }

        cliente.nombreCompleto = nombreCompleto;
        cliente.telefono = telefono;

        await cliente.save();

        res.json({ message: 'Cliente actualizado' });

    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar' });
    }
});

app.post('/api/clientes/delete', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email requerido' });
    }

    try {
        const cliente = await Cliente.findOne({ email });

        if (!cliente) {
            return res.status(400).json({ message: 'Cliente no existe' });
        }

        await cliente.deleteOne();

        res.json({ message: 'Cliente eliminado' });

    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
});

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

app.post('/api/polizas/register', async (req, res) => {
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

app.get('/api/polizas', async (req, res) => {
    try {
        const polizas = await Poliza.find();
        res.json(polizas);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener pólizas' });
    }
});

app.post('/api/polizas/update', async (req, res) => {
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

app.post('/api/polizas/delete', async (req, res) => {
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

app.post('/api/inmuebles', async (req, res) => {
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop(); 
    const nombreUnico = Date.now() + '.' + ext;
    cb(null, nombreUnico);
  }
});

const upload = multer({ 
  storage: storage, 
  fileFilter: function (req, file, cb) { 
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo PDFs'), false);
    }
  }
});

app.post('/api/documentos/upload', (req, res) => {
  upload.single('documento')(req, res, async function (err) {

    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { cliente_id, poliza_id } = req.body; 

    if (!req.file || !cliente_id || !poliza_id) { 
      return res.status(400).json({ message: 'Faltan datos o archivo' });
    }

    try {
      const nuevoDocumento = new Documento({ 
        cliente_id,
        poliza_id,
        documento_nombre: req.file.originalname,
        documento_tipo: req.file.mimetype, 
        documento_url: `/uploads/${req.file.filename}` 
      });

      await nuevoDocumento.save();  
      res.json({ message: 'Documento subido', documento: nuevoDocumento });

    } catch (err) {
      res.status(500).json({ message: 'Error al subir documento' });
    }
  });
});

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



