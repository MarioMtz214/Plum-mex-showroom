// --------------------------frontend/js/projects.js--------------------------

const dropzone = document.getElementById("dropzone");
const mediaInput = document.getElementById("media");
const form = document.getElementById("projectForm");
const message = document.getElementById("message");

let selectedFile = null;

dropzone.addEventListener("click", () => {
  mediaInput.click();
});

mediaInput.addEventListener("change", () => {
  if (mediaInput.files.length > 0) {
    selectedFile = mediaInput.files[0];
    dropzone.textContent = `Selected: ${selectedFile.name}`;
  }
});

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("bg-gray-100");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("bg-gray-100");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("bg-gray-100");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    selectedFile = files[0];
    dropzone.textContent = `Selected: ${selectedFile.name}`;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  const title = form.elements["title"].value;
  const description = form.elements["description"].value;
  const type = form.elements["type"].value;

  if (!selectedFile) {
    message.textContent = "⚠️ Debes seleccionar una imagen o video.";
    message.classList.remove("text-green-600");
    message.classList.add("text-red-600");
    return;
  }

  formData.append("title", title);
  formData.append("description", description);
  formData.append("mediaType", type);
  formData.append("media", selectedFile);

  console.log("📦 Formulario enviado:");
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const response = await fetch("http://localhost:3000/api/gallery/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("✅ Subida exitosa:", data);
  } catch (error) {
    console.error("❌ Error al subir:", error);
    message.textContent = "❌ Error al subir archivo.";
    message.classList.remove("text-green-600");
    message.classList.add("text-red-600");
  }
});

async function loadGallery() {
  try {
    const res = await fetch("http://localhost:3000/api/gallery/projects");
    const projects = await res.json();

    const videoCarousel = document.getElementById("video-carousel");
    const imageGallery = document.getElementById("image-gallery");

    if (!videoCarousel || !imageGallery) {
      console.warn("Galería no presente en esta vista.");
      return;
    }

    videoCarousel.innerHTML = "";
    imageGallery.innerHTML = "";

    projects.forEach((proj) => {
      const url = `/uploads/${proj.filename}`;

      if (proj.media_type === "video") {
        const videoEl = document.createElement("video");
        videoEl.src = url;
        videoEl.controls = true;
        videoEl.className = "w-64 h-auto rounded";
        videoCarousel.appendChild(videoEl);
      } else if (proj.media_type === "image") {
        const imgEl = document.createElement("img");
        imgEl.src = url;
        imgEl.alt = proj.title;
        imgEl.title = proj.description;
        imgEl.className = "rounded shadow cursor-pointer hover:opacity-80";
        imageGallery.appendChild(imgEl);
      }
    });
  } catch (error) {
    console.error("Error loading gallery:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadGallery);