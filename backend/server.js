// --------------------------backend/server.js--------------------------
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const contactRoute = require('./routes/contact');
const galleryRoutes = require("./routes/gallery");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static folder for uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
app.use('/api/contact', contactRoute);
app.use("/api/gallery", galleryRoutes);

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self' http://localhost:3000");
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});