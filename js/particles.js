(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const ACCENT = [129, 140, 248];   // indigo accent, used sparingly
  const DOT = [255, 255, 255];       // faint white dots
  const LINK_DIST = 150;             // max distance to draw a connecting line
  const PARTICLE_COUNT_BASE = 95;    // scaled by viewport area below

  const REPEL_RADIUS = 150;          // how close the cursor needs to be to push a particle
  const REPEL_STRENGTH = 38;         // max px a particle gets pushed at close range
  const EASE_IN = 0.15;              // how fast particles react to the cursor
  const EASE_OUT = 0.06;             // how fast particles settle back when cursor moves away

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr, particles;
  let mouseX = -9999, mouseY = -9999;

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
    const count = Math.max(36, Math.min(140, Math.round(PARTICLE_COUNT_BASE * area / (1440 * 900))));
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 0.8,
      accent: Math.random() < 0.15,
      // offset from natural drift position, pushed by cursor proximity
      ox: 0,
      oy: 0
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

      // cursor repulsion: push away smoothly, ease back when out of range
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS && dist > 0.01) {
        const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
        const targetOx = (dx / dist) * force;
        const targetOy = (dy / dist) * force;
        p.ox += (targetOx - p.ox) * EASE_IN;
        p.oy += (targetOy - p.oy) * EASE_IN;
      } else {
        p.ox += (0 - p.ox) * EASE_OUT;
        p.oy += (0 - p.oy) * EASE_OUT;
      }

      const rx = p.x + p.ox, ry = p.y + p.oy;
      const c = p.accent ? ACCENT : DOT;
      ctx.beginPath();
      ctx.arc(rx, ry, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${p.accent ? 0.7 : 0.5})`;
      ctx.fill();
    }

    // draw connecting lines between nearby particles (using displaced positions)
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const ax = a.x + a.ox, ay = a.y + a.oy;
        const bx = b.x + b.ox, by = b.y + b.oy;
        const dx = ax - bx, dy = ay - by;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.16;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
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

  // Canvas has pointer-events:none so it never blocks clicks — listen on
  // window instead. clientX/clientY line up with our coordinate space
  // since the canvas covers the full viewport.
  if (!reduceMotion) {
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    document.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });
  }
})();
