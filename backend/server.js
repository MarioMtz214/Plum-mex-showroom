// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const contactRoute = require('./routes/contact');
const galleryRoutes = require("./routes/gallery");
// express-rate-limit
const rateLimit = require("express-rate-limit");

const app = express();
// const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CORS ---
app.use(cors({
  origin: ["https://plum-mex.co.uk", "https://www.plum-mex.co.uk"],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

// --- CSP (temporal más permisivo) ---
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});

// Content-Security-Policy (agrega Cloudinary y Render)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https://res.cloudinary.com; connect-src 'self' https://plummex-backend.onrender.com https://api.cloudinary.com; img-src 'self' data: https://res.cloudinary.com; media-src 'self' data: https://res.cloudinary.com;"
  );
  next();
});

// Static folder for old uploads (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ RATE LIMIT SOLO PARA CONTACT
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/contact', contactRoute);
app.use('/api/gallery', galleryRoutes);
app.use("/api/contact", contactLimiter);

// Start server
const listener = app.listen(process.env.PORT || 10000, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${listener.address().port}`);
});
