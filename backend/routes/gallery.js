// backend/routes/gallery.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
const db = require("../db/database"); // tu archivo: backend/db/database.js

// Cloudinary config (desde variables de entorno)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar multer en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 } // límite 250MB
});

// Función helper para subir un buffer a Cloudinary
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// 📤 POST /api/gallery/upload  — Subir proyecto con múltiples imágenes/videos
router.post("/upload", upload.array("media", 20), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description)
      return res.status(400).json({ error: "Missing title or description" });
    if (!req.files || !req.files.length)
      return res.status(400).json({ error: "No files uploaded" });

    // 1️⃣ Insertar proyecto en DB
    const insertProject = `
      INSERT INTO projects (title, description, uploaded_at)
      VALUES (?, ?, datetime('now'))
    `;
    const result = await new Promise((resolve, reject) => {
      db.run(insertProject, [title, description], function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID });
      });
    });
    const projectId = result.lastID;

    // 2️⃣ Subir archivos a Cloudinary y guardar metadatos
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

      // Guardar metadatos en la tabla project_media
      const insertMedia = `
        INSERT INTO project_media (project_id, media_type, filename, url, public_id, uploaded_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `;
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

// 📥 GET /api/gallery/projects — Obtener todos los proyectos con sus medios
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
        db.all(
          "SELECT id, media_type, filename, url, public_id FROM project_media WHERE project_id = ?",
          [project.id],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
          }
        );
      });
      project.media = media;
    }

    res.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

module.exports = router;