const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
app.use('/uploads', express.static('uploads'));

const documentoSchema = new mongoose.Schema({
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
  documento_nombre: {
    type: String,
    required: true
  },
  documento_tipo: {
    type: String,
    required: true
  },
  documento_url: {
    type: String,
    required: true
  },
  documento_date: {
    type: Date,
    default: Date.now
  }
});

const documento = mongoose.model('documento', documentoSchema);

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

router.post('/upload', upload.single('documento'), async (req, res) => {
  const { cliente_id, poliza_id } = req.body;

  if (!req.file || !cliente_id || !poliza_id) {
    return res.status(400).json({ message: 'Faltan datos o archivo' });
  }

  try {
    const nuevoDocumento = new documento({
      cliente_id,
      poliza_id,
      documento_nombre: req.file.originalname,
      documento_tipo: req.file.mimetype,
      documento_url: `/uploads/${req.file.filename}`
    });

    await nuevoDocumento.save();

    res.json({
      message: 'Documento subido',
      documento: nuevoDocumento
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Error al subir documento',
      error: err.message
    });
  }
});
