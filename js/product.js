// product.js — custom slider (no external slider library)
document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const wrapper = document.querySelector('.main-slider .swiper-wrapper');
  const slides = Array.from(document.querySelectorAll('.main-slider .swiper-slide'));
  const thumbs = Array.from(document.querySelectorAll('.thumb-slider .swiper-slide'));
  const prevBtn = document.querySelector('.slider-nav-left');
  const nextBtn = document.querySelector('.slider-nav-right');

  if (!wrapper || slides.length === 0) return;

  let index = 0;

  function update() {
    // translate wrapper
    wrapper.style.transform = `translateX(-${index * 100}%)`;
    // update active thumb
    thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    // aria/current
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i === index ? 'false' : 'true'));
  }

  // Next / Prev
  function next() { index = (index + 1) % slides.length; update(); }
  function prev() { index = (index - 1 + slides.length) % slides.length; update(); }

  nextBtn && nextBtn.addEventListener('click', next);
  prevBtn && prevBtn.addEventListener('click', prev);

  // Thumbnails click
  thumbs.forEach((t, i) => {
    t.addEventListener('click', () => { index = i; update(); });
    t.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { index = i; update(); } });
  });

  // Keyboard left/right
  document.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });

  // ensure wrapper sizing (images may change size) — recalc slide widths
  function recalc() {
    // slides are flex: 0 0 100% so no per-slide width needed; ensure transform applied
    update();
  }
  window.addEventListener('resize', recalc);

  // initialize
  update();

  /* Swatch tint handling (unchanged behavior) */
  const swatches = Array.from(document.querySelectorAll('.swatch'));
  function applyTint(color) {
    const isBlack = !color || color.toLowerCase() === '#000' || color.toLowerCase() === '#000000' || color.toLowerCase() === 'black';
    document.querySelectorAll('.img-tint').forEach(el => {
      if (isBlack) { el.style.background = 'transparent'; el.style.opacity = '0'; }
      else { el.style.background = color; el.style.opacity = '0.28'; }
    });
  }
  swatches.forEach(s => {
    s.addEventListener('click', () => {
      swatches.forEach(x => x.classList.remove('active'));
      s.classList.add('active');
      applyTint(s.dataset.color || '');
      // Change first main slider image
      const imgSrc = s.dataset.img;
      if (imgSrc) {
        const firstSlideImg = document.querySelector('.main-slider .swiper-slide:first-child .slide-img');
        if (firstSlideImg) {
          firstSlideImg.src = imgSrc;
        }
      }
      // Go to first slide to show the changed image
      index = 0;
      update();
    });
    s.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') s.click(); });
  });
  const active = document.querySelector('.swatch.active'); if (active) applyTint(active.dataset.color || '');
});