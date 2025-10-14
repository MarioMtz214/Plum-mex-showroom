// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const contactRoute = require('./routes/contact');
const galleryRoutes = require("./routes/gallery");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: permite tu dominio y también conexiones seguras (https)
app.use(cors({
  origin: ["https://plum-mex.co.uk", "https://www.plum-mex.co.uk"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

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

// Routes
app.use('/api/contact', contactRoute);
app.use('/api/gallery', galleryRoutes);

// Start server
const listener = app.listen(process.env.PORT || 10000, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${listener.address().port}`);
});



// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const path = require('path');
// const contactRoute = require('./routes/contact');
// const galleryRoutes = require("./routes/gallery");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Solo permitir tu frontend
// app.use(cors({
//   origin: "https://plum-mex.co.uk",
//   methods: ["GET","POST","PUT","DELETE"],
// }));

// // Content-Security-Policy
// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy", 
//     "default-src 'self'; connect-src 'self' https://plummex-backend.onrender.com"
//   );
//   next();
// });

// // Static folder for uploaded media
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Import routes
// app.use('/api/contact', contactRoute);
// app.use("/api/gallery", galleryRoutes);

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });