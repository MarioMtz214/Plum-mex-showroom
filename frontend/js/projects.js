// frontend/js/projects.js
// frontend/js/projects.js

const dropzone = document.getElementById("dropzone");
const mediaInput = document.getElementById("media");
const form = document.getElementById("projectForm");
const message = document.getElementById("message");

let selectedFiles = [];

// Abrir file picker
dropzone.addEventListener("click", () => mediaInput.click());

// Selección de archivos
mediaInput.addEventListener("change", () => {
  if (mediaInput.files.length > 0) {
    selectedFiles = Array.from(mediaInput.files);
    dropzone.textContent = `Selected: ${selectedFiles.length} file(s)`;
  }
});

// Drag & Drop
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("bg-gray-100");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("bg-gray-100"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("bg-gray-100");
  selectedFiles = Array.from(e.dataTransfer.files);
  dropzone.textContent = `Selected: ${selectedFiles.length} file(s)`;
});

// Enviar formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = form.elements["type"].value;
  if (!type) {
    message.textContent = "⚠️ Debes seleccionar un tipo (image o video).";
    message.classList.add("text-red-600");
    return;
  }

  if (selectedFiles.length === 0) {
    message.textContent = "⚠️ Debes seleccionar al menos un archivo.";
    message.classList.add("text-red-600");
    return;
  }

  const formData = new FormData();
  formData.append("title", form.elements["title"].value);
  formData.append("description", form.elements["description"].value);
  formData.append("mediaType", type);

  selectedFiles.forEach(file => formData.append("media", file));

  console.log("Uploading files:", selectedFiles);
  console.log("Title:", form.elements["title"].value);
  console.log("Description:", form.elements["description"].value);
  console.log("Type:", type);

  try {
    const res = await fetch("http://localhost:3000/api/gallery/upload", {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    if (res.ok && data.success) {
      message.textContent = "✅ Proyecto subido correctamente.";
      message.classList.remove("text-red-600");
      message.classList.add("text-green-600");
      form.reset();
      dropzone.textContent = "Drag & drop images or videos here or click to select";
      selectedFiles = [];
      loadGallery();
      loadProjects();
    } else {
      throw new Error(data.error || "Error desconocido");
    }
  } catch (err) {
    console.error(err);
    message.textContent = `❌ Error al subir archivo: ${err.message}`;
    message.classList.remove("text-green-600");
    message.classList.add("text-red-600");
  }
});

// Load projects into delete select
async function loadProjects() {
  const select = document.getElementById("deleteSelect");
  select.innerHTML = "";
  try {
    const res = await fetch("http://localhost:3000/api/gallery/projects");
    const projects = await res.json();

    projects.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.title;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading projects:", err);
  }
}

// Delete selected projects
document.addEventListener("DOMContentLoaded", () => {
  loadProjects();

  const deleteForm = document.getElementById("deleteForm");
  deleteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const selected = Array.from(document.getElementById("deleteSelect").selectedOptions).map(o => o.value);
    if (selected.length === 0) {
      document.getElementById("deleteMessage").textContent = "⚠️ Please select at least one project to delete.";
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        document.getElementById("deleteMessage").textContent = "✅ Project(s) deleted successfully.";
        loadProjects();
        loadGallery();
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      document.getElementById("deleteMessage").textContent = `❌ Error deleting projects: ${err.message}`;
    }
  });
});

// Load gallery for frontend
async function loadGallery() {
  try {
    const res = await fetch("http://localhost:3000/api/gallery/projects");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    const projects = await res.json();
    console.log("Projects loaded:", projects);

    const videoCarousel = document.getElementById("video-carousel");
    const imageGallery = document.getElementById("image-gallery");

    if (!videoCarousel || !imageGallery) return;

    videoCarousel.innerHTML = "";
    imageGallery.innerHTML = "";

    projects.forEach((proj) => {
      proj.media.forEach((mediaItem) => {
        const url = `/uploads/${mediaItem.filename}`;
        if (mediaItem.media_type === "video") {
          const videoEl = document.createElement("video");
          videoEl.src = url;
          videoEl.controls = true;
          videoEl.className = "w-64 h-auto rounded";
          videoCarousel.appendChild(videoEl);
        } else if (mediaItem.media_type === "image") {
          const imgEl = document.createElement("img");
          imgEl.src = url;
          imgEl.alt = proj.title;
          imgEl.title = proj.description;
          imgEl.className = "rounded shadow cursor-pointer hover:opacity-80";
          imageGallery.appendChild(imgEl);
        }
      });
    });
  } catch (error) {
    console.error("Error loading gallery:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadGallery);