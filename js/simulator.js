// simulator.js — Interactive neuron signal simulator

(function () {
  const canvas = document.getElementById('neuron-sim');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const W = canvas.width;
  const H = canvas.height;

  let msMode = false;
  let signalType = 'burst';
  let animating = false;
  let signals = [];
  let frame = 0;
  let animFrame;

  // ── Neuron geometry ──────────────────────────────────────────
  const soma = { x: 90, y: H / 2, r: 22 };

  // Each branch: { id, parent, x1,y1, x2,y2, order, label? }
  const branches = [
    // Primary dendrite (apical)
    { id: 0, parent: -1, x1: 112, y1: soma.y, x2: 220, y2: soma.y, order: 1, label: 'Primaire tak' },
    // Secondary
    { id: 1, parent: 0, x1: 220, y1: soma.y, x2: 330, y2: soma.y - 55, order: 2 },
    { id: 2, parent: 0, x1: 220, y1: soma.y, x2: 330, y2: soma.y + 55, order: 2, label: '2e orde' },
    // Tertiary from 1
    { id: 3, parent: 1, x1: 330, y1: soma.y - 55, x2: 430, y2: soma.y - 110, order: 3 },
    { id: 4, parent: 1, x1: 330, y1: soma.y - 55, x2: 430, y2: soma.y - 20, order: 3 },
    // Tertiary from 2
    { id: 5, parent: 2, x1: 330, y1: soma.y + 55, x2: 430, y2: soma.y + 20, order: 3 },
    { id: 6, parent: 2, x1: 330, y1: soma.y + 55, x2: 430, y2: soma.y + 110, order: 3 },
    // Quaternary from 3
    { id: 7, parent: 3, x1: 430, y1: soma.y - 110, x2: 520, y2: soma.y - 150, order: 4, label: '4e orde (ver)' },
    { id: 8, parent: 3, x1: 430, y1: soma.y - 110, x2: 520, y2: soma.y - 80, order: 4 },
    // Quaternary from 6
    { id: 9, parent: 6, x1: 430, y1: soma.y + 110, x2: 520, y2: soma.y + 80, order: 4 },
    { id: 10, parent: 6, x1: 430, y1: soma.y + 110, x2: 520, y2: soma.y + 150, order: 4 },
    // Axon (going left)
    { id: 11, parent: -1, x1: soma.x - soma.r, y1: soma.y, x2: 30, y2: soma.y, order: 0, isAxon: true },
  ];

  // Spine positions (end of tips)
  const spines = [
    { bId: 7, x: 530, y: soma.y - 150 },
    { bId: 8, x: 530, y: soma.y - 80 },
    { bId: 4, x: 440, y: soma.y - 20 },
    { bId: 5, x: 440, y: soma.y + 20 },
    { bId: 9, x: 530, y: soma.y + 80 },
    { bId: 10, x: 530, y: soma.y + 150 },
  ];

  // MS damage markers (where myelin is stripped)
  const msDamage = [
    { x1: 180, y1: soma.y - 4, x2: 210, y2: soma.y + 4, bId: 0 },
    { x1: 360, y1: soma.y - 62, x2: 380, y2: soma.y - 48, bId: 1 },
    { x1: 450, y1: soma.y + 22, x2: 470, y2: soma.y + 10, bId: 5 },
  ];

  // ── Draw helpers ─────────────────────────────────────────────

  function branchWidth(order) {
    if (order === 0) return 2;
    return Math.max(1.5, 6 - order * 1.1);
  }

  function drawBase() {
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Draw branches
    for (const b of branches) {
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.strokeStyle = b.isAxon ? '#4B5563' : '#374151';
      ctx.lineWidth = branchWidth(b.order);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Order label
      if (b.label) {
        const mx = (b.x1 + b.x2) / 2, my = (b.y1 + b.y2) / 2;
        ctx.fillStyle = '#6B7280';
        ctx.font = '10px DM Sans, sans-serif';
        ctx.fillText(b.label, mx - 20, my - 8);
      }
    }

    // Spines
    for (const sp of spines) {
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#4B5563';
      ctx.fill();
    }

    // Soma
    const somaGrad = ctx.createRadialGradient(soma.x - 5, soma.y - 5, 2, soma.x, soma.y, soma.r);
    somaGrad.addColorStop(0, '#6B7280');
    somaGrad.addColorStop(1, '#374151');
    ctx.beginPath();
    ctx.arc(soma.x, soma.y, soma.r, 0, Math.PI * 2);
    ctx.fillStyle = somaGrad;
    ctx.fill();
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#D1D5DB';
    ctx.font = '10px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Soma', soma.x, soma.y + soma.r + 14);
    ctx.textAlign = 'left';

    // MS damage patches
    if (msMode) {
      for (const d of msDamage) {
        for (let i = 0; i < 4; i++) {
          const t = i / 3;
          const x = d.x1 + (d.x2 - d.x1) * t;
          const y = d.y1 + (d.y2 - d.y1) * t;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(220,38,38,0.25)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(220,38,38,0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // MS label
      ctx.fillStyle = '#FCA5A5';
      ctx.font = '10px DM Sans, sans-serif';
      ctx.fillText('⚡ MS-schade (demyelinisatie)', 10, 18);
    }

    // Distance labels
    ctx.fillStyle = '#4B5563';
    ctx.font = '9px DM Sans, sans-serif';
    ctx.fillText('← dicht bij soma', soma.x + 25, H - 12);
    ctx.fillText('ver van soma →', 400, H - 12);
  }

  // ── Signal objects ──────────────────────────────────────────

  function buildSignalPath(type) {
    // Returns array of signal wave objects
    const paths = [];

    if (type === 'burst') {
      // 3 voltage waves, each slightly delayed
      for (let i = 0; i < 3; i++) {
        paths.push(makeWave('voltage', i * 0.08, 1.0));
      }
      // 2 calcium waves (slower, less penetration)
      for (let i = 0; i < 2; i++) {
        paths.push(makeWave('calcium', i * 0.1 + 0.05, 0.85));
      }
    } else {
      paths.push(makeWave('voltage', 0, msMode ? 0.55 : 0.85));
      paths.push(makeWave('calcium', 0.04, msMode ? 0.3 : 0.65));
    }
    return paths;
  }

  function makeWave(type, delay, maxReach) {
    return {
      type,
      delay,
      maxReach,
      // Each branch gets its own progress tracker
      branchProgress: Object.fromEntries(branches.map(b => [b.id, -1])),
      done: false,
      color: type === 'voltage' ? '#F59E0B' : '#06B6D4',
      glowColor: type === 'voltage' ? 'rgba(245,158,11,' : 'rgba(6,182,212,',
    };
  }

  function getSignalStrengthAtOrder(order, wave) {
    const baseDecay = msMode ? 0.35 : 0.18;
    const burstBonus = signalType === 'burst' ? 0.1 : 0;
    let strength = wave.maxReach - order * (baseDecay - burstBonus);
    return Math.max(0, Math.min(1, strength));
  }

  // ── Animation ───────────────────────────────────────────────

  let globalT = 0;

  function animate() {
    drawBase();

    globalT += 0.012;
    let allDone = true;

    for (const wave of signals) {
      const t = globalT - wave.delay;
      if (t < 0) { allDone = false; continue; }

      // Travel along branches in order
      // Order 0 (axon), then order 1, 2, 3, 4
      for (const b of branches) {
        const strength = getSignalStrengthAtOrder(b.order, wave);
        if (strength <= 0) continue;

        // Gate: parent must be progressed enough
        let startT = 0;
        if (b.parent >= 0) {
          const parentProg = wave.branchProgress[b.parent];
          if (parentProg < 0.9) { allDone = false; continue; }
          startT = 0; // starts after parent finishes
        }

        // Local progress along this branch
        const localT = Math.min(1, t * (1.4 - b.order * 0.15));
        wave.branchProgress[b.id] = localT;

        if (localT < 1) allDone = false;

        // Draw signal dot along branch
        const px = b.x1 + (b.x2 - b.x1) * localT;
        const py = b.y1 + (b.y2 - b.y1) * localT;
        const alpha = strength * (1 - localT * 0.2);

        // Glow
        const glowR = 12 * strength;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        glow.addColorStop(0, wave.glowColor + alpha * 0.8 + ')');
        glow.addColorStop(1, wave.glowColor + '0)');
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(px, py, 3 * strength + 1, 0, Math.PI * 2);
        ctx.fillStyle = wave.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Trail
        if (localT > 0.1) {
          const tx0 = b.x1 + (b.x2 - b.x1) * Math.max(0, localT - 0.2);
          const ty0 = b.y1 + (b.y2 - b.y1) * Math.max(0, localT - 0.2);
          const trailGrad = ctx.createLinearGradient(tx0, ty0, px, py);
          trailGrad.addColorStop(0, wave.glowColor + '0)');
          trailGrad.addColorStop(1, wave.glowColor + alpha * 0.5 + ')');
          ctx.beginPath();
          ctx.moveTo(tx0, ty0);
          ctx.lineTo(px, py);
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = branchWidth(b.order) * 0.8;
          ctx.stroke();
        }

        // Light up spines at terminus
        if (localT > 0.92) {
          for (const sp of spines) {
            if (sp.bId === b.id) {
              const spAlpha = (localT - 0.92) / 0.08 * alpha;
              const spGlow = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 10 * strength);
              spGlow.addColorStop(0, wave.glowColor + spAlpha + ')');
              spGlow.addColorStop(1, wave.glowColor + '0)');
              ctx.beginPath();
              ctx.arc(sp.x, sp.y, 10 * strength, 0, Math.PI * 2);
              ctx.fillStyle = spGlow;
              ctx.fill();
              ctx.beginPath();
              ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
              ctx.fillStyle = wave.color;
              ctx.globalAlpha = spAlpha;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
      }

      // Light up soma at start
      if (t < 0.3) {
        const somaAlpha = (0.3 - t) / 0.3;
        const sg = ctx.createRadialGradient(soma.x, soma.y, 0, soma.x, soma.y, soma.r * 2);
        sg.addColorStop(0, wave.glowColor + somaAlpha * 0.9 + ')');
        sg.addColorStop(1, wave.glowColor + '0)');
        ctx.beginPath();
        ctx.arc(soma.x, soma.y, soma.r * 2, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
      }
    }

    // Update strength bar
    updateStrengthBar();

    if (!allDone) {
      animFrame = requestAnimationFrame(animate);
    } else {
      showInfo(msMode
        ? '⚠️ MS-schade: signalen lekken weg, dendrieten bereiken minder'
        : '✅ Signaal succesvol door alle dendrieten gereisd'
      );
    }
  }

  function updateStrengthBar() {
    const fill = document.getElementById('strength-fill');
    if (!fill) return;
    // Show decoupling: voltage vs calcium at order 4
    const voltageWave = signals.find(s => s.type === 'voltage');
    if (!voltageWave) return;
    const strength = getSignalStrengthAtOrder(4, voltageWave);
    fill.style.width = (strength * 100) + '%';
    if (msMode) {
      fill.style.background = 'linear-gradient(90deg, #DC2626, #F97316)';
    } else {
      fill.style.background = 'linear-gradient(90deg, #F59E0B, #06B6D4)';
    }
  }

  function showInfo(msg) {
    const el = document.getElementById('sim-info');
    if (el) {
      el.innerHTML = '<p>' + msg + '</p>';
      el.style.opacity = '1';
    }
    animating = false;
  }

  // ── Controls ─────────────────────────────────────────────────

  document.getElementById('ms-toggle')?.addEventListener('change', function () {
    msMode = this.checked;
    if (!animating) drawBase();
    updateStrengthBar();
  });

  document.querySelectorAll('.sig-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.sig-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      signalType = this.dataset.type;
    });
  });

  document.getElementById('fire-btn')?.addEventListener('click', function () {
    if (animating) return;
    animating = true;
    signals = buildSignalPath(signalType);
    globalT = 0;
    if (animFrame) cancelAnimationFrame(animFrame);

    const el = document.getElementById('sim-info');
    if (el) {
      el.style.opacity = '0';
    }

    animate();
  });

  // Initial draw
  drawBase();
  updateStrengthBar();
})();
