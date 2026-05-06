const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

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

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
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