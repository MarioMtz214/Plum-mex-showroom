const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db/database');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// POST /upload
router.post('/upload', upload.single('media'), (req, res) => {
  console.log('POST /upload received');
  console.log('Body:', req.body);
  console.log('File:', req.file);

  const { title, description, mediaType } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const sql = `INSERT INTO projects (title, description, media_type, filename) VALUES (?, ?, ?, ?)`;
  db.run(sql, [title, description, mediaType, req.file.filename], function(err) {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Project uploaded successfully' });
  });
});

module.exports = router;