// --------------------------frontend/js/gallery.js--------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const videoContainer = document.getElementById("video-carousel");
  const imageContainer = document.getElementById("image-gallery");

  try {
    const res = await fetch("http://localhost:3000/api/gallery/projects");
    const data = await res.json();

    console.log("Respuesta del servidor:", data);
    data.forEach((item) => {
      const card = document.createElement("div");
      card.classList.add("rounded", "shadow", "bg-white", "overflow-hidden");

      if (item.media_type === "video") {
        card.innerHTML = `
                    <video controls class="w-[300px] h-[200px]">
                        <source src="http://localhost:3000/uploads/${item.filename}" type="video/mp4">
                    </video>
                    <div class="p-2">
                        <h3 class="text-lg font-semibold">${item.title}</h3>
                        <p class="text-sm text-gray-600">${item.description}</p>
                    </div>
                `;
        videoContainer.appendChild(card);
      } else {
        card.innerHTML = `
                    <img src="http://localhost:3000/uploads/${item.filename}" alt="${item.title}" class="w-full h-60 object-cover cursor-pointer popup-trigger">
                    <div class="p-2">
                        <h3 class="text-lg font-semibold">${item.title}</h3>
                        <p class="text-sm text-gray-600">${item.description}</p>
                    </div>
                `;
        card
          .querySelector("img")
          .addEventListener("click", () => showPopup(item));
        imageContainer.appendChild(card);
      }
    });
  } catch (err) {
    console.error("Error loading projects:", err);
  }
});

function showPopup(project) {
  const popup = document.createElement("div");
  popup.classList.add(
    "fixed",
    "inset-0",
    "bg-black",
    "bg-opacity-70",
    "flex",
    "items-center",
    "justify-center",
    "z-50"
  );

  popup.innerHTML = `
        <div class="bg-white p-6 rounded-lg relative max-w-lg">
            <button class="absolute top-2 right-2 text-xl font-bold" onclick="this.parentElement.parentElement.remove()">×</button>
            <img src="http://localhost:3000/uploads/${project.filename}" alt="${project.title}" class="w-full h-auto rounded mb-4">
            <h3 class="text-xl font-bold mb-2">${project.title}</h3>
            <p>${project.description}</p>
        </div>
    `;
  document.body.appendChild(popup);
}
