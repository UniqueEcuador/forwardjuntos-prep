// main.js — Scroll animations & general interactions

(function () {

  // ── Scroll-triggered animations (data-aos elements) ──────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger cards in a grid
        const siblings = entry.target.parentElement.querySelectorAll('[data-aos]');
        let delay = 0;
        siblings.forEach((el, idx) => {
          if (el === entry.target) delay = idx * 80;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

  // ── Smooth active nav on scroll (optional enhancement) ───────
  // Hero scroll hint auto-hides
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        scrollHint.style.opacity = '0';
      } else {
        scrollHint.style.opacity = '1';
      }
    }, { passive: true });
  }

  // ── Keyboard accessibility for toggle ────────────────────────
  document.querySelectorAll('.sig-btn').forEach(btn => {
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // ── Canvas resize for sim ─────────────────────────────────────
  function resizeSimCanvas() {
    const wrap = document.querySelector('.sim-canvas-wrap');
    const canvas = document.getElementById('neuron-sim');
    if (!wrap || !canvas) return;
    // Keep aspect ratio, scale CSS only
    const w = wrap.clientWidth;
    canvas.style.width = w + 'px';
    canvas.style.height = Math.round(w * (480 / 620)) + 'px';
  }
  resizeSimCanvas();
  window.addEventListener('resize', resizeSimCanvas, { passive: true });

})();
