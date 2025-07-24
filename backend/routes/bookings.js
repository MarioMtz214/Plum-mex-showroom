const express = require('express');
const router = express.Router();

// Aquí puedes enviar a un controller si lo necesitas
router.post('/', (req, res) => {
  const { nombre, email, telefono, fecha, mensaje } = req.body;
  console.log('Cita recibida:', req.body);

  // Aquí iría la lógica para guardar en BD o enviar por email
  res.status(200).json({ mensaje: 'Cita recibida correctamente' });
});

module.exports = router;