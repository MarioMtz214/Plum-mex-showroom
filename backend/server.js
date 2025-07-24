const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const galleryRoutes = require('./routes/gallery');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/gallery', galleryRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});