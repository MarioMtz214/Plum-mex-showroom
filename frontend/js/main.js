
  const slider = document.getElementById('testimonialSlider');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');

  let currentSlide = 0;

  const updateSlider = () => {
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
  };

  next.addEventListener('click', () => {
    const maxSlide = slider.children.length - 1;
    if (currentSlide < maxSlide) currentSlide++;
    else currentSlide = 0;
    updateSlider();
  });

  prev.addEventListener('click', () => {
    const maxSlide = slider.children.length - 1;
    if (currentSlide > 0) currentSlide--;
    else currentSlide = maxSlide;
    updateSlider();
  });

   // Mostrar el popup al cargar
  document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('maintenance-popup');
    popup.classList.remove('hidden');

    // Cerrar popup
    document.getElementById('close-popup').addEventListener('click', () => {
      popup.style.display = 'none';
    });
  });


    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('menu');

    menuBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      menu.classList.toggle('flex');
      menu.classList.toggle('flex-col');
      menu.classList.toggle('space-y-4');
      menu.classList.toggle('mt-4');
  });
