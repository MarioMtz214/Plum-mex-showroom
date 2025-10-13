// backend/routes/gallery.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
const db = require('../db/database'); // tu archivo: backend/db/database.js

// Cloudinary config (desde env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB límite (ajusta si quieres)
});

// helper para subir buffer a Cloudinary
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// Endpoint upload (acepta múltiples archivos)
router.post("/upload", upload.array("media", 20), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Missing title or description" });
    if (!req.files || !req.files.length) return res.status(400).json({ error: "No files uploaded" });

    // Insert project
    const insertProject = `INSERT INTO projects (title, description, uploaded_at) VALUES (?, ?, datetime('now'))`;
    const result = await new Promise((resolve, reject) => {
      db.run(insertProject, [title, description], function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID });
      });
    });
    const projectId = result.lastID;

    // subir cada archivo a Cloudinary
    for (const file of req.files) {
      const resource_type = file.mimetype.startsWith("video/") ? "video" : "image";
      const uploadOptions = {
        resource_type,
        folder: `plummex/projects/${projectId}`,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      };

      const uploadResult = await uploadBufferToCloudinary(file.buffer, uploadOptions);

      // guardar metadatos en DB
      const insertMedia = `INSERT INTO media (project_id, media_type, filename, url, public_id, uploaded_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`;
      await new Promise((resolve, reject) => {
        db.run(insertMedia, [
          projectId,
          resource_type,
          file.originalname,
          uploadResult.secure_url,
          uploadResult.public_id
        ], function (err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID });
        });
      });
    }

    res.json({ success: true, projectId });
  } catch (err) {
    console.error("Gallery upload error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

// GET projects (con media)
router.get("/projects", async (req, res) => {
  try {
    const projects = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM projects ORDER BY uploaded_at DESC", [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    for (const project of projects) {
      const media = await new Promise((resolve, reject) => {
        db.all("SELECT id, media_type, filename, url, public_id FROM media WHERE project_id = ?", [project.id], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
      project.media = media;
    }

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;