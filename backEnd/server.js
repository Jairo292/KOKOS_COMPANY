const express = require('express'); //para crear tu servidor
const mongoose = require('mongoose'); //para trabajar con Mongo
const cors = require('cors'); //para permitir solicitudes
const bcrypt = require('bcryptjs'); //para encriptar contraseñas
const jwt = require('jsonwebtoken'); // para generar tokens de autenticación
require('dotenv').config(); //para cargar variables de entorno desde .env

const app = express(); // Crear instancia de Express


app.use(cors());  // Habilitar CORS para todas las rutas
app.use(express.json());  //para recibir datos en formato JSON

// Variables de entorno
const PORT = process.env.PORT || 5000;  // Puerto del servidor
const MONGO_URI = process.env.MONGO_URI;  // URI de conexión a MongoDB
const JWT_SECRET = process.env.JWT_SECRET; //clave secreteaa

// Conexión a MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado a Mongo KOKOS'))
    .catch((err) => console.error('Error de conexion:', err));

// Esquema de Usuario
const userSchema = new mongoose.Schema({
    username: { type: String, required: true }, //el nombre de usuario es obligatorio
    email: {  //el correo electrónico es obligatorio y unico
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email no válido']
    },
    password: {  //es obligatoria
        type: String,
        required: true,
        select: false
    }
});

// Encriptar contraseña antes de guardar por eso dice pre
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10); // esto es para encriptar la contraseña 
    this.password = await bcrypt.hash(this.password, salt); // esto es para encriptar la contraseña
});

const Usuario = mongoose.model('Usuario', userSchema); // Modelo de Usuario


// registro de usuario, el /api/register es la ruta para registrar un nuevo usuario que es un endpoint
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

        // Verificar si el correo ya existe
        const existingUser = await Usuario.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Este correo ya está registrado' });
        }

        // Crear y guardar
        const newuser = new Usuario({ username, email, password });
        await newuser.save();

        res.status(201).json({ message: '¡Cuenta creada con éxito!' });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// inicio de sesión, el /api/login es la ruta para iniciar sesión que es un endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña requeridos' });
        }

        // Buscar usuario y pedir la contraseña 
        const user = await Usuario.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'El usuario no existe' });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Generar Token
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

// Esquema de Cliente como lo hicimos con el user
const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    fechaRegistro: { type: Date, default: Date.now }
});

const Cliente = mongoose.model('Cliente', clienteSchema);

//crear cliente, el /api/clientes es la ruta para crear un nuevo cliente que es un endpoint
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

//para obtener clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
    }
});

//para actualiza clientes
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

//eliminar cliente
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

// Esquema de Póliza
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

//crear polizzas
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

//obtener polizas
app.get('/api/polizas', async (req, res) => {
    try {
        const polizas = await Poliza.find();
        res.json(polizas);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener pólizas' });
    }
});

//actualizar polizas
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

//eliminar polizas
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

