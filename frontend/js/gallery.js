// frontend/js/gallery.js

document.addEventListener("DOMContentLoaded", () => {
  // Selecciona todas las tarjetas de video y proyectos
  const videoCards = document.querySelectorAll(".video-card");
  const projectCards = document.querySelectorAll(".project-card");

  // Para cada tarjeta de video
  videoCards.forEach(card => {
    card.addEventListener("click", () => {
      const videoSrc = card.dataset.video;
      const title = card.querySelector("h2").innerText;
      const description = card.querySelector("p").innerText;
      showPopup({ type: "video", src: videoSrc, title, description });
    });
  });

  // Para cada tarjeta de imagen (proyecto)
  projectCards.forEach(card => {
    card.addEventListener("click", () => {
      const images = card.dataset.images ? card.dataset.images.split(",") : [];
      const title = card.querySelector("h2").innerText;
      const description = card.querySelector("p").innerText;
      showPopup({ type: "image", images, title, description });
    });
  });
});

// 🔹 Popup dinámico
function showPopup(project) {
  const popup = document.createElement("div");
  popup.classList.add(
    "fixed", "inset-0", "bg-black/80",
    "flex", "items-center", "justify-center",
    "z-50", "p-6"
  );

  let contentHtml = "";

  if (project.type === "video") {
    contentHtml = `
      <div class="relative w-full max-w-3xl bg-black rounded-lg overflow-hidden">
        <video class="w-full h-auto max-h-[80vh] object-contain" controls autoplay playsinline>
          <source src="${project.src}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <button class="absolute top-2 right-2 text-white text-3xl font-bold z-10" 
                onclick="this.closest('.popup-container').parentElement.remove()">×</button>
      </div>`;
  } else if (project.type === "image") {
    const slidesHtml = project.images.map((img, idx) => `
      <img class="popup-slide ${idx === 0 ? "block" : "hidden"} w-full max-h-[70vh] object-contain" 
           src="${img.trim()}" alt="${project.title}">
    `).join("");

    const dotsHtml = project.images.map((_, idx) => `
      <button class="carousel-dot w-3 h-3 rounded-full bg-gray-400 opacity-${idx === 0 ? "100" : "50"} mx-1" data-index="${idx}"></button>
    `).join("");

    contentHtml = `
      <div class="carousel-container w-full flex items-center justify-center mb-4 relative">
        ${slidesHtml}
        <button onclick="changeSlide(this, -1)" 
                class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full w-10 h-10 flex items-center justify-center z-10">‹</button>
        <button onclick="changeSlide(this, 1)" 
                class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full w-10 h-10 flex items-center justify-center z-10">›</button>
      </div>
      <div class="flex justify-center mb-2">${dotsHtml}</div>`;
  }

  popup.innerHTML = `
    <div class="popup-container bg-white p-4 md:p-6 rounded-lg max-w-3xl w-full flex flex-col items-center relative">
      ${contentHtml}
      ${project.type === "image" ? `<button class="absolute top-2 right-2 text-xl font-bold" onclick="this.closest('.popup-container').parentElement.remove()">×</button>` : ""}
      <h3 class="text-xl font-bold mt-4 text-center">${project.title}</h3>
      <p class="text-gray-600 text-center">${project.description}</p>
    </div>
  `;

  document.body.appendChild(popup);

  if (project.type === "image") {
    const dots = popup.querySelectorAll(".carousel-dot");
    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const index = parseInt(dot.dataset.index);
        showSlide(popup, index);
      });
    });
  }
}

// 🔹 Funciones auxiliares del carrusel
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
    if (dots[i]) {
      dots[i].classList.toggle("opacity-100", i === index);
      dots[i].classList.toggle("opacity-50", i !== index);
    }
  });
}

