// product-drag.js — custom slider (no external slider library) with drag/swipe and thumbnail auto-centering
document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const container = document.querySelector('.main-slider');
  const wrapper = document.querySelector('.main-slider .swiper-wrapper');
  const slides = Array.from(document.querySelectorAll('.main-slider .swiper-slide'));
  const thumbs = Array.from(document.querySelectorAll('.thumb-slider .swiper-slide'));
  const prevBtn = document.querySelector('.slider-nav-left');
  const nextBtn = document.querySelector('.slider-nav-right');

  if (!container || !wrapper || slides.length === 0) return;

  let index = 0;
  let containerWidth = container.clientWidth;
  const thumbWrap = document.querySelector('.thumb-slider');

  // Drag state
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let deltaX = 0;
  let pointerId = null;

  function scrollThumbsToIndex(i) {
    if (!thumbWrap) return;
    const thumb = thumbs[i];
    if (!thumb) return;
    // Calculate scrollLeft to center the thumb
    const target = thumb.offsetLeft + (thumb.offsetWidth / 2) - (thumbWrap.clientWidth / 2);
    thumbWrap.scrollTo({ left: target, behavior: 'smooth' });
  }

  function update() {
    // Use percent-based transform for smooth transitions when not dragging
    wrapper.style.transition = '';
    wrapper.style.transform = `translateX(-${index * 100}%)`;

    // update active thumb
    thumbs.forEach((t, i) => t.classList.toggle('active', i === index));

    // aria/current
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i === index ? 'false' : 'true'));

    // auto-center active thumbnail
    scrollThumbsToIndex(index);
  }

  function getBaseTranslatePx(i) { return -i * containerWidth; }

  // Next / Prev
  function next() { index = (index + 1) % slides.length; update(); }
  function prev() { index = (index - 1 + slides.length) % slides.length; update(); }

  nextBtn && nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); });
  prevBtn && prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); });

  // Thumbnails click
  thumbs.forEach((t, i) => {
    t.addEventListener('click', () => { index = i; update(); });
    t.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { index = i; update(); } });
  });

  // Thumbnail nav buttons (scroll the strip by a chunk)
  const thumbPrevBtn = document.querySelector('.thumb-nav-left');
  const thumbNextBtn = document.querySelector('.thumb-nav-right');
  function scrollThumbsBy(amount) {
    if (!thumbWrap) return;
    thumbWrap.scrollBy({ left: amount, behavior: 'smooth' });
  }
  thumbPrevBtn && thumbPrevBtn.addEventListener('click', () => scrollThumbsBy(-Math.round((thumbWrap.clientWidth || 200) * 0.6)));
  thumbNextBtn && thumbNextBtn.addEventListener('click', () => scrollThumbsBy(Math.round((thumbWrap.clientWidth || 200) * 0.6)));

  // Pointer drag for thumbnails (desktop mouse drag to scroll)
  if (thumbWrap) {
    let isThumbDragging = false;
    let thumbStartX = 0;
    let thumbStartScroll = 0;

    function onThumbPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isThumbDragging = true;
      thumbStartX = e.clientX;
      thumbStartScroll = thumbWrap.scrollLeft;
      thumbWrap.setPointerCapture && thumbWrap.setPointerCapture(e.pointerId);
    }
    function onThumbPointerMove(e) {
      if (!isThumbDragging) return;
      const dx = e.clientX - thumbStartX;
      thumbWrap.scrollLeft = thumbStartScroll - dx;
    }
    function onThumbPointerUp(e) {
      if (!isThumbDragging) return;
      isThumbDragging = false;
      thumbWrap.releasePointerCapture && thumbWrap.releasePointerCapture(e.pointerId);
    }
    thumbWrap.addEventListener('pointerdown', onThumbPointerDown);
    window.addEventListener('pointermove', onThumbPointerMove);
    window.addEventListener('pointerup', onThumbPointerUp);
    window.addEventListener('pointercancel', onThumbPointerUp);
  }

  // Keyboard left/right
  document.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });

  // Resize handler
  function recalc() { containerWidth = container.clientWidth; update(); }
  window.addEventListener('resize', recalc);

  // Pointer drag / swipe handlers
  function onPointerDown(e) {
    // left mouse or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    currentX = startX;
    deltaX = 0;
    container.setPointerCapture && container.setPointerCapture(pointerId);
    wrapper.style.transition = 'none';
    container.classList.add('grabbing');
    // recalc width to be safe
    containerWidth = container.clientWidth;
  }

  function onPointerMove(e) {
    if (!isDragging || e.pointerId !== pointerId) return;
    currentX = e.clientX;
    deltaX = currentX - startX;
    const base = getBaseTranslatePx(index);
    // translate in px while dragging
    wrapper.style.transform = `translateX(${base + deltaX}px)`;
  }

  function onPointerUp(e) {
    if (!isDragging || (pointerId !== null && e.pointerId !== pointerId)) return;
    isDragging = false;
    container.classList.remove('grabbing');
    container.releasePointerCapture && container.releasePointerCapture(pointerId);

    const threshold = Math.max(40, containerWidth * 0.12); // px or 12% of width

    if (deltaX > threshold) { prev(); }
    else if (deltaX < -threshold) { next(); }
    else { update(); }

    // reset
    startX = currentX = deltaX = 0;
    pointerId = null;
  }

  container.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  // Initialize
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
    s.addEventListener('click', () => { swatches.forEach(x => x.classList.remove('active')); s.classList.add('active'); applyTint(s.dataset.color || ''); });
    s.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') s.click(); });
  });
  const active = document.querySelector('.swatch.active'); if (active) applyTint(active.dataset.color || '');

  // Quote form submit handling (prevent full page submit and show success)
  const quoteForm = document.querySelector('.quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const modalEl = document.getElementById('modal-icon-1');
      // Replace form with a simple thank you message
      const wrapper = modalEl.querySelector('.form-wrapper');
      if (wrapper) {
        wrapper.innerHTML = '<div class="text-center" style="padding:40px 10px;"><h4 style="font-weight:700;">Thanks — Request Received</h4><p class="text-muted">We\'ll get back to you shortly about your quote request.</p></div>';
      }
      // close modal after small delay
      setTimeout(() => {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        bsModal && bsModal.hide();
      }, 1100);
    });
  }

  // Artwork modal: file input preview + submit handling
  const artworkForm = document.querySelector('.artwork-form');
  const artworkFile = document.getElementById('artwork-file');
  const artworkLabel = document.querySelector('.file-upload-label .filename');
  if (artworkFile) {
    artworkFile.addEventListener('change', (e) => {
      const f = artworkFile.files && artworkFile.files[0];
      artworkLabel.textContent = f ? f.name : 'Upload Artwork';
    });
  }
  if (artworkForm) {
    artworkForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const modalEl = document.getElementById('modal-icon-2');
      const wrapper = modalEl.querySelector('.form-wrapper');
      if (wrapper) {
        wrapper.innerHTML = '<div class="text-center" style="padding:40px 10px;"><h4 style="font-weight:700;">Thanks — Template Request Received</h4><p class="text-muted">We\'ll send the artwork template to your email shortly.</p></div>';
      }
      setTimeout(() => {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        bsModal && bsModal.hide();
      }, 1100);
    });
  }

  // Sample order submit handling
  const sampleForm = document.querySelector('.sample-form');
  if (sampleForm) {
    sampleForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const modalEl = document.getElementById('modal-icon-3');
      const wrapper = modalEl.querySelector('.form-wrapper');
      if (wrapper) {
        wrapper.innerHTML = '<div class="text-center" style="padding:40px 10px;"><h4 style="font-weight:700;">Thanks — Sample Order Received</h4><p class="text-muted">We\'ll contact you shortly to arrange your sample.</p></div>';
      }
      setTimeout(() => {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        bsModal && bsModal.hide();
      }, 1100);
    });
  }

  // Spec sheet - populate modal with product info and implement download
  const specModal = document.getElementById('modal-icon-4');
  function populateSpecModal() {
    if (!specModal) return;
    const title = document.querySelector('.product-title')?.textContent || '';
    const desc = document.querySelector('.product-desc')?.textContent || '';
    const mainImg = document.querySelector('.main-slider .swiper-slide img')?.src || 'img/product.jpg';
    const specTitleEl = specModal.querySelector('.spec-title'); if (specTitleEl) specTitleEl.textContent = title;
    const specDescEl = specModal.querySelector('.spec-desc'); if (specDescEl) specDescEl.textContent = desc;
    const specImgEl = specModal.querySelector('.spec-image img'); if (specImgEl) specImgEl.src = mainImg;

    // swatches
    const swatches = document.querySelectorAll('.color-swatches .swatch');
    const specSw = specModal.querySelector('.spec-swatches'); if (specSw) specSw.innerHTML = '';
    swatches && swatches.forEach(s => {
      const span = document.createElement('span');
      span.style.background = s.dataset.color || window.getComputedStyle(s).backgroundColor;
      span.title = s.getAttribute('aria-label') || '';
      specSw && specSw.appendChild(span);
    });

    // price table
    const priceTable = document.querySelector('.price-table');
    const targetPrice = specModal.querySelector('.spec-price-table'); if (targetPrice) targetPrice.innerHTML = priceTable ? priceTable.outerHTML : '';

    // specs
    const left = document.querySelectorAll('.product-specs .col-md-6')[0];
    const right = document.querySelectorAll('.product-specs .col-md-6')[1];
    specModal.querySelector('.spec-specs').innerHTML = left ? left.innerHTML : '';
    specModal.querySelector('.spec-imprint').innerHTML = right ? right.innerHTML : '';

    // prepare printable content
    const specPrint = specModal.querySelector('.spec-print');
    if (specPrint) {
      specPrint.innerHTML = '<div class="print-content">' + specModal.querySelector('.spec-wrapper').innerHTML + '</div>';
    }
  }

  if (specModal) {
    specModal.addEventListener('show.bs.modal', populateSpecModal);
  }

  const downloadBtn = document.getElementById('download-spec');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      if (!specModal) return;
      const content = specModal.querySelector('.spec-print').innerHTML || specModal.querySelector('.spec-wrapper').innerHTML;
      const win = window.open('', '_blank');
      const styles = `
        <style>
          body{font-family: 'Poppins', Arial, sans-serif; color:#222; padding:28px;}
          .spec-title{font-weight:800; font-size:22px; margin-bottom:8px;}
          .spec-desc{color:#666; max-width:540px;}
          .row{display:flex;gap:20px;}
          .col{flex:1}
          img{max-width:100%; height:auto}
          table{border-collapse:collapse; width:100%; margin-top:12px}
          th, td{border:1px solid #eee; padding:8px; text-align:left}
        </style>`;
      win.document.write(`<html><head><title>Spec Sheet</title>${styles}</head><body>${content}</body></html>`);
      win.document.close();
      win.focus();
      win.print();
      setTimeout(()=>{ try{ win.close(); } catch(e){} }, 1000);
    });
  }

});