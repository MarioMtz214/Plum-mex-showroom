// --------------------------backend/routes/gallery.js--------------------------
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db"); // tu conexión SQLite

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Ruta para subir proyecto con múltiples archivos
router.post("/upload", upload.array("media", 20), async (req, res) => {
  try {
    const { title, description, mediaType } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Missing title or description" });

    // Guardar proyecto
    const result = await db.run(
      "INSERT INTO projects (title, description) VALUES (?, ?)",
      [title, description]
    );
    const projectId = result.lastID;

    // Guardar cada archivo
    const files = req.files;
    for (const file of files) {
      // Detectar si es video o imagen
      let type = "image";
      if (file.mimetype.startsWith("video/")) type = "video";

      await db.run(
        "INSERT INTO media (project_id, media_type, filename) VALUES (?, ?, ?)",
        [projectId, type, file.filename]
      );
    }

    res.json({ success: true, projectId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Obtener todos los proyectos con media
router.get("/projects", async (req, res) => {
  try {
    const projects = await db.all("SELECT * FROM projects ORDER BY uploaded_at DESC");

    for (const project of projects) {
      const media = await db.all("SELECT * FROM media WHERE project_id = ?", [project.id]);
      project.media = media;
    }

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;