document.addEventListener("DOMContentLoaded", async () => {
  const videoContainer = document.getElementById("video-carousel");
  const imageContainer = document.getElementById("image-gallery");

  try {
    const res = await fetch("http://localhost:3000/api/gallery/projects");
    const data = await res.json();

    console.log("Respuesta del servidor:", data);

    data.forEach((project) => {
      const card = document.createElement("div");
      card.classList.add("rounded", "shadow", "bg-white", "overflow-hidden");

      // Mostrar portada: la primera imagen del proyecto
      const cover = project.media.find(m => m.media_type === "image") || project.media[0];

      if (cover.media_type === "video") {
        // Video card
        card.innerHTML = `
          <video src="http://localhost:3000/uploads/${cover.filename}" 
                 class="w-full h-60 object-cover cursor-pointer popup-video" controls></video>
          <div class="p-2">
            <h3 class="text-lg font-semibold">${project.title}</h3>
            <p class="text-sm text-gray-600">${project.description}</p>
          </div>`;
        videoContainer.appendChild(card);

        const videoEl = card.querySelector(".popup-video");
        videoEl.addEventListener("click", () => {
          // Pausar video de la card
          videoEl.pause();
          showPopup(project, true); // videoPopup = true
        });
      } else {
        // Image card
        card.innerHTML = `
          <img src="http://localhost:3000/uploads/${cover.filename}" 
               alt="${project.title}" 
               class="w-full h-60 object-cover cursor-pointer popup-trigger">
          <div class="p-2">
            <h3 class="text-lg font-semibold">${project.title}</h3>
            <p class="text-sm text-gray-600">${project.description}</p>
          </div>`;
        imageContainer.appendChild(card);

        card.querySelector(".popup-trigger").addEventListener("click", () => showPopup(project, false));
      }
    });
  } catch (err) {
    console.error("Error loading projects:", err);
  }
});

// Popup
function showPopup(project, videoPopup = false) {
  const popup = document.createElement("div");
  popup.classList.add(
    "fixed", "inset-0", "bg-black", "bg-opacity-70",
    "flex", "items-center", "justify-center", "z-50", "p-4"
  );

  let contentHtml = "";

  if (videoPopup) {
    // Solo mostrar el video (primer media que sea video)
    const video = project.media.find(m => m.media_type === "video");
    contentHtml = `
      <video class="w-full max-h-[80vh] object-contain" controls autoplay>
        <source src="http://localhost:3000/uploads/${video.filename}" type="video/mp4">
      </video>`;
  } else {
    // Carrusel de imágenes
    const slidesHtml = project.media.map((media, idx) => {
      if (media.media_type === "video") return ""; // ignorar videos en carrusel de imágenes
      return `<img class="popup-slide ${idx === 0 ? "block" : "hidden"} w-full max-h-[70vh] object-contain" 
                   src="http://localhost:3000/uploads/${media.filename}" alt="${project.title}">`;
    }).join("");

    const indicatorsHtml = project.media.map((media, idx) => {
      if (media.media_type === "video") return ""; // ignorar videos en carrusel
      return `<button class="carousel-dot w-3 h-3 rounded-full bg-gray-400 opacity-${idx === 0 ? '100' : '50'} mx-1" data-index="${idx}"></button>`;
    }).join("");

    contentHtml = `
      <div class="carousel-container w-full flex items-center justify-center mb-4 relative">
        ${slidesHtml}
        <button onclick="changeSlide(this, -1)" 
                class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full w-10 h-10 flex items-center justify-center z-10">
          ‹
        </button>
        <button onclick="changeSlide(this, 1)" 
                class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full w-10 h-10 flex items-center justify-center z-10">
          ›
        </button>
      </div>
      <div class="flex justify-center mb-2">
        ${indicatorsHtml}
      </div>`;
  }

  popup.innerHTML = `
    <div class="bg-white p-4 md:p-6 rounded-lg max-w-3xl w-full flex flex-col items-center relative popup-container">
      <button class="absolute top-2 right-2 text-xl font-bold" onclick="
        this.closest('.popup-container').parentElement.querySelectorAll('video').forEach(v => v.pause());
        this.closest('.popup-container').parentElement.remove()
      ">×</button>

      ${contentHtml}

      <h3 class="text-xl font-bold mb-1">${project.title}</h3>
      <p class="text-gray-600">${project.description}</p>
    </div>
  `;

  document.body.appendChild(popup);

  if (!videoPopup) {
    // Manejo de bolitas solo para imágenes
    const dots = popup.querySelectorAll(".carousel-dot");
    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const index = parseInt(dot.dataset.index);
        showSlide(popup, index);
      });
    });
  }
}

// Función para cambiar slide con flechas (solo imágenes)
function changeSlide(btn, direction) {
  const popup = btn.closest(".popup-container");
  const slides = popup.querySelectorAll(".popup-slide");
  const currentIndex = Array.from(slides).findIndex(s => s.classList.contains("block"));
  const nextIndex = (currentIndex + direction + slides.length) % slides.length;
  showSlide(popup, nextIndex);
}

function showSlide(popup, index) {
  const slides = popup.querySelectorAll(".popup-slide");
  const dots = popup.querySelectorAll(".carousel-dot");
  slides.forEach((s, i) => {
    s.classList.toggle("block", i === index);
    s.classList.toggle("hidden", i !== index);
    if(dots[i]) {
      dots[i].classList.toggle("opacity-100", i === index);
      dots[i].classList.toggle("opacity-50", i !== index);
    }
  });
}