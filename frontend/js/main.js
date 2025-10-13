// frontend/js/main.js

// frontend/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  /* ===== Slider testimonial (si existe) ===== */
  try {
    const slider = document.getElementById('testimonialSlider');
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');

    if (slider && prev && next) {
      let currentSlide = 0;
      const updateSlider = () => {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
      };

      next.addEventListener('click', () => {
        const maxSlide = slider.children.length - 1;
        currentSlide = currentSlide < maxSlide ? currentSlide + 1 : 0;
        updateSlider();
      });

      prev.addEventListener('click', () => {
        const maxSlide = slider.children.length - 1;
        currentSlide = currentSlide > 0 ? currentSlide - 1 : maxSlide;
        updateSlider();
      });
    }
  } catch (err) {
    console.warn('Slider init failed:', err);
  }

  // navbar toggle menu and cookies
       const toggle = document.getElementById('menu-toggle');
        const navbar = document.getElementById('navbar');

        toggle.addEventListener('click', () => {
            navbar.classList.toggle('hidden');
        });

        const banner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('accept-cookies');
        const declineBtn = document.getElementById('decline-cookies');

  /* ===== Maintenance popup ===== */
  try {
    const popup = document.getElementById('maintenance-popup');
    if (popup) {
      // Ensure popup hidden state is handled by classes; show it now.
      popup.classList.remove('hidden');

      // Ensure there's a close button: if not, create one and append to inner container.
      let closeBtn = document.getElementById('close-popup');
      if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.id = 'close-popup';
        closeBtn.setAttribute('aria-label', 'Close maintenance popup');
        // Tailwind-like inline utility for appearance (but adjust if you prefer)
        // closeBtn.className = 'absolute top-3 right-3 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center';
        // closeBtn.innerHTML = '&times;';

        // find inner white container and make it position:relative so absolute close works
        const inner = popup.querySelector('.bg-white') || popup.querySelector('.rounded-lg') || popup.firstElementChild;
        if (inner) {
          inner.style.position = inner.style.position || 'relative';
          inner.appendChild(closeBtn);
        } else {
          // fallback append to popup
          popup.appendChild(closeBtn);
        }
      }

      // Close logic
      closeBtn.addEventListener('click', () => {
        popup.classList.add('hidden');
      });

      // Click outside to close (click on backdrop)
      // popup.addEventListener('click', (e) => {
      //   if (e.target === popup) popup.classList.add('hidden');
      // });

      // Esc to close
      // document.addEventListener('keydown', (e) => {
      //   if (e.key === 'Escape') popup.classList.add('hidden');
      // });
    }
  } catch (err) {
    console.warn('Popup init failed:', err);
  }

  /* ===== Navbar / hamburguesa ===== */
  try {
    const toggle = document.getElementById('menu-toggle'); // coincide con tu HTML
    const navbar = document.getElementById('navbar'); // coincide con tu HTML
    if (toggle && navbar) {
      toggle.addEventListener('click', () => {
        navbar.classList.toggle('hidden');
      });
    }
  } catch (err) {
    console.warn('Navbar init failed:', err);
  }

  /* ===== Cookie banner ===== */
  try {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');

    if (banner && acceptBtn && declineBtn) {
      if (!localStorage.getItem('cookieConsent')) {
        banner.classList.remove('hidden');
      }

      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.classList.add('hidden');
      });

      declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        banner.classList.add('hidden');
      });
    }
  } catch (err) {
    console.warn('Cookie banner init failed:', err);
  }
});

/* ===== Imagen rotatoria mejorada: preload + espera fade + no solapamientos ===== */
function startImageSlider(elementId, interval = 5000, fadeDuration = 700) {
  const slider = document.getElementById(elementId);
  if (!slider) return console.warn(`Slider not found: ${elementId}`);

  const imagesAttr = slider.getAttribute('data-images');
  if (!imagesAttr) return console.warn(`data-images missing for ${elementId}`);
  const images = JSON.parse(imagesAttr);
  if (!images || images.length === 0) return;

  // Asegurar que la primera imagen está en el src
  if (!slider.src || slider.src.length === 0) {
    slider.src = images[0];
  }

  // Asegúrate de tener la clase de transición en CSS (Tailwind): transition-opacity duration-{ms}
  // Ej: class="transition-opacity duration-700 ease-in-out"
  let index = images.findIndex(i => i === slider.src);
  if (index === -1) index = 0;

  // Helper sleep
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  // Preload util
  const preload = (url) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => {
      console.warn(`Failed to preload image: ${url}`);
      resolve(false); // evitar bloquear si falla
    };
    img.src = url;
  });

  // loop recursivo para evitar solapamientos
  const loop = async () => {
    const nextIndex = (index + 1) % images.length;

    // 1) Fade out
    slider.classList.add('opacity-0');

    // 2) Espera a que termine la animación de salida (fadeDuration)
    await sleep(fadeDuration);

    // 3) Preload de la siguiente imagen (evita flash)
    await preload(images[nextIndex]);

    // 4) Cambiar src y forzar repaint antes de fade-in
    slider.src = images[nextIndex];
    // small delay para asegurar que el browser tiene la nueva src lista para mostrar
    requestAnimationFrame(() => {
      // 5) Fade in
      slider.classList.remove('opacity-0');
    });

    // actualizar índice
    index = nextIndex;

    // 6) Esperar el intervalo total antes del próximo cambio
    setTimeout(loop, interval);
  };

  // arrancar el bucle después del primer intervalo (si quieres que cambie inmediatamente, llama a loop() sin timeout)
  setTimeout(loop, interval);
}

// Inicializaciones (ejemplo)
// Asegúrate que los atributos data-images estén correctos en el HTML
startImageSlider('kitchen-slider', 5000, 700);
startImageSlider('bathroom-slider', 4000, 700);


// document.querySelectorAll('.toggle-btn').forEach(btn => {
//   btn.addEventListener('click', () => {
//     const p = btn.previousElementSibling;
//     p.classList.toggle('line-clamp-9');

//     if (p.classList.contains('line-clamp-9')) {
//       btn.textContent = "Read more";
//     } else {
//       btn.textContent = "Show less";
//     }
//   });
// });

document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = btn.previousElementSibling;

    if (p.classList.contains('line-clamp-9')) {
      // Quita el clamp y activa el scroll
      p.classList.remove('line-clamp-9');
      p.classList.add('scroll-mode');
      btn.textContent = "Show less";
    } else {
      // Vuelve al modo recortado
      p.classList.add('line-clamp-9');
      p.classList.remove('scroll-mode');
      btn.textContent = "Read more";
    }
  });
});


  // const slider = document.getElementById('testimonialSlider');
  // const prev = document.getElementById('prevBtn');
  // const next = document.getElementById('nextBtn');

  // let currentSlide = 0;

  // const updateSlider = () => {
  //   slider.style.transform = `translateX(-${currentSlide * 100}%)`;
  // };

  // next.addEventListener('click', () => {
  //   const maxSlide = slider.children.length - 1;
  //   if (currentSlide < maxSlide) currentSlide++;
  //   else currentSlide = 0;
  //   updateSlider();
  // });

  // prev.addEventListener('click', () => {
  //   const maxSlide = slider.children.length - 1;
  //   if (currentSlide > 0) currentSlide--;
  //   else currentSlide = maxSlide;
  //   updateSlider();
  // });

  //  // Mostrar el popup al cargar
  // document.addEventListener('DOMContentLoaded', () => {
  //   const popup = document.getElementById('maintenance-popup');
  //   popup.classList.remove('hidden');

  //   // Cerrar popup
  //   document.getElementById('close-popup').addEventListener('click', () => {
  //     popup.style.display = 'none';
  //   });
  // });


  //   const menuBtn = document.getElementById('menu-btn');
  //   const menu = document.getElementById('menu');

  //   menuBtn.addEventListener('click', () => {
  //     menu.classList.toggle('hidden');
  //     menu.classList.toggle('flex');
  //     menu.classList.toggle('flex-col');
  //     menu.classList.toggle('space-y-4');
  //     menu.classList.toggle('mt-4');
  // });

      // const toggle = document.getElementById('menu-toggle');
      // const navbar = document.getElementById('navbar');

      //   toggle.addEventListener('click', () => {
      //       navbar.classList.toggle('hidden');
      //   });

      //   const banner = document.getElementById('cookie-banner');
      //   const acceptBtn = document.getElementById('accept-cookies');
      //   const declineBtn = document.getElementById('decline-cookies');

      //   // Mostrar banner si no hay decisión guardada
      //   if (!localStorage.getItem('cookieConsent')) {
      //       banner.classList.remove('hidden');
      //   }

      //   acceptBtn.addEventListener('click', () => {
      //       localStorage.setItem('cookieConsent', 'accepted');
      //       banner.classList.add('hidden');
      //   });

      //   declineBtn.addEventListener('click', () => {
      //       localStorage.setItem('cookieConsent', 'declined');
      //       banner.classList.add('hidden');
      //   });
