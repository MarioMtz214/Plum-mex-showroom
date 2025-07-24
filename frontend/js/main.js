
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
