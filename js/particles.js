(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Weighted color palette — mostly white, with a scattering of accent
  // colors for visual interest. Weights are relative, not percentages.
  const PALETTE = [
    { rgb: [255, 255, 255], weight: 45, alpha: 0.65 }, // white
    { rgb: [129, 140, 248], weight: 18, alpha: 0.85 }, // indigo / violet
    { rgb: [56, 189, 248], weight: 13, alpha: 0.85 },  // cyan
    { rgb: [244, 114, 182], weight: 12, alpha: 0.85 }, // pink
    { rgb: [251, 146, 60], weight: 12, alpha: 0.85 }   // coral / amber
  ];
  const PALETTE_TOTAL = PALETTE.reduce((sum, p) => sum + p.weight, 0);

  function pickColor() {
    let r = Math.random() * PALETTE_TOTAL;
    for (const p of PALETTE) {
      if (r < p.weight) return p;
      r -= p.weight;
    }
    return PALETTE[0];
  }

  const LINK_DIST = 160;             // max distance to draw a connecting line
  const PARTICLE_COUNT_BASE = 110;   // scaled by viewport area below

  const REPEL_RADIUS = 160;          // how close the cursor needs to be to push a particle
  const REPEL_STRENGTH = 42;         // max px a particle gets pushed at close range
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
    const count = Math.max(40, Math.min(160, Math.round(PARTICLE_COUNT_BASE * area / (1440 * 900))));
    particles = new Array(count).fill(0).map(() => {
      const color = pickColor();
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 2.2 + 1.4,
        rgb: color.rgb,
        alpha: color.alpha,
        ox: 0,
        oy: 0
      };
    });
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;

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
      ctx.beginPath();
      ctx.arc(rx, ry, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${p.alpha})`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const ax = a.x + a.ox, ay = a.y + a.oy;
        const bx = b.x + b.ox, by = b.y + b.oy;
        const dx = ax - bx, dy = ay - by;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.22;
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
