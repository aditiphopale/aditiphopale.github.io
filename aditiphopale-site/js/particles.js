(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const ACCENT = [129, 140, 248];   // indigo accent, used sparingly
  const DOT = [255, 255, 255];       // faint white dots
  const LINK_DIST = 130;             // max distance to draw a connecting line
  const PARTICLE_COUNT_BASE = 60;    // scaled by viewport area below

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr, particles;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticles() {
    const area = w * h;
    const count = Math.max(24, Math.min(90, Math.round(PARTICLE_COUNT_BASE * area / (1440 * 900))));
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.6,
      accent: Math.random() < 0.12
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // update + draw dots
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;

      const c = p.accent ? ACCENT : DOT;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${p.accent ? 0.55 : 0.35})`;
      ctx.fill();
    }

    // draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(129,140,248,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  makeParticles();
  step();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      makeParticles();
      if (reduceMotion) step();
    }, 150);
  });
})();
