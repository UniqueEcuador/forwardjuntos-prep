// canvas-bg.js — Animated neuron network for hero background

(function () {
  const canvas = document.getElementById('neuron-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes = [], edges = [], signals = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    init();
  }

  function init() {
    nodes = [];
    edges = [];
    signals = [];
    const count = Math.floor((W * H) / 18000);
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 3 + 1.5,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        pulse: Math.random() * Math.PI * 2
      });
    }
    buildEdges();
  }

  function buildEdges() {
    edges = [];
    const maxDist = 140;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) edges.push({ a: i, b: j, d });
      }
    }
  }

  function spawnSignal() {
    if (edges.length === 0) return;
    const edge = edges[Math.floor(Math.random() * edges.length)];
    const useCalcium = Math.random() > 0.5;
    signals.push({
      edge,
      t: 0,
      speed: 0.004 + Math.random() * 0.004,
      color: useCalcium ? '#06B6D4' : '#F59E0B',
      size: Math.random() * 2 + 1.5
    });
  }

  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Soft gradient overlay
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    grad.addColorStop(0, 'rgba(15,17,23,0)');
    grad.addColorStop(1, 'rgba(15,17,23,0.5)');

    frame++;

    // Update & draw edges
    for (const e of edges) {
      const na = nodes[e.a], nb = nodes[e.b];
      const alpha = 1 - e.d / 140;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = `rgba(148,163,184,${alpha * 0.12})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Update nodes
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.pulse += 0.03;

      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
      glow.addColorStop(0, `rgba(245,158,11,${0.3 + 0.1 * Math.sin(n.pulse)})`);
      glow.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251,191,36,${0.6 + 0.2 * Math.sin(n.pulse)})`;
      ctx.fill();
    }

    // Rebuild edges occasionally (nodes move)
    if (frame % 120 === 0) buildEdges();

    // Update & draw signals
    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i];
      s.t += s.speed;
      if (s.t > 1) { signals.splice(i, 1); continue; }

      const na = nodes[s.edge.a], nb = nodes[s.edge.b];
      const x = na.x + (nb.x - na.x) * s.t;
      const y = na.y + (nb.y - na.y) * s.t;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, s.size * 5);
      glow.addColorStop(0, s.color.replace(')', ',0.6)').replace('rgb', 'rgba'));
      glow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, s.size * 5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
    }

    // Spawn signals randomly
    if (frame % 40 === 0 && signals.length < 15) spawnSignal();

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  resize();
  tick();
})();
