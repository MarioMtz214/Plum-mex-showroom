// Referencias
const dropzone = document.getElementById("dropzone");
const mediaInput = document.getElementById("media");
const form = document.getElementById("projectForm");
const message = document.getElementById("message");

// Hacer clic en el área para abrir el file dialog
dropzone.addEventListener("click", () => {
  mediaInput.click();
});

// Mostrar nombre del archivo seleccionado
mediaInput.addEventListener("change", () => {
  if (mediaInput.files.length > 0) {
    dropzone.textContent = `Selected: ${mediaInput.files[0].name}`;
  }
});

// Drag over
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("bg-gray-100");
});

// Drag leave
dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("bg-gray-100");
});

// Drop
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("bg-gray-100");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    mediaInput.files = files;
    dropzone.textContent = `Selected: ${files[0].name}`;
  }
});

// Manejar el envío del formulario (simulado aquí, debes conectarlo a tu backend más adelante)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  // Cambia el nombre del campo para coincidir con el backend
  formData.set("mediaType", formData.get("type"));
  formData.delete("type"); // elimina el original si quieres evitar confusión

  try {
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    const response = await fetch('http://localhost:3000/api/gallery/upload', {
  method: 'POST',
  body: formData,
})

    const result = await response.json();

    if (response.ok) {
      message.textContent = result.message || "Project uploaded successfully!";
      form.reset();
      dropzone.textContent = "Drag & drop an image or video here";
    } else {
      message.textContent = result.message || "Error uploading project.";
      message.classList.remove("text-green-600");
      message.classList.add("text-red-600");
    }
  } catch (err) {
    console.error("❌ Error al subir:", err);
    message.textContent = "Unexpected error occurred.";
    message.classList.remove("text-green-600");
    message.classList.add("text-red-600");
  }
});

async function loadGallery() {
  try {
    const res = await fetch("/api/gallery");
    const projects = await res.json();

    const videoCarousel = document.getElementById("video-carousel");
    const imageGallery = document.getElementById("image-gallery");

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

// Carga la galería al cargar la página
window.addEventListener("DOMContentLoaded", loadGallery);
