/* ═══════════════════════════════════════════════
   AGRI-HUB · Smart Storage Network
   script.js — Canvas, Auth, Telemetry, Navigation
═══════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   1. CANVAS BACKGROUND — Bioluminescent Spores
────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bioCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, spores, rafId;

  /* ── Resize handler ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── Spore constructor ── */
  function createSpore(index) {
    const layer = Math.random(); // 0 = back, 1 = front (depth)
    return {
      x:        Math.random() * W,
      y:        H + Math.random() * 60,
      radius:   (0.8 + Math.random() * 2.8) * (0.4 + layer * 0.7),
      speedY:   (0.12 + Math.random() * 0.28) * (0.5 + layer * 0.8),
      speedX:   (Math.random() - 0.5) * 0.22,
      opacity:  0.08 + Math.random() * 0.38 * (0.3 + layer * 0.7),
      opBase:   0,
      pulse:    Math.random() * Math.PI * 2,
      pulseSpd: 0.008 + Math.random() * 0.016,
      type:     Math.random() < 0.72 ? 'emerald' : 'gold', // colour split
      trail:    [],
      maxTrail: Math.floor(4 + Math.random() * 8),
    };
  }

  function buildSpores(count) {
    spores = [];
    for (let i = 0; i < count; i++) {
      const s = createSpore(i);
      s.y = Math.random() * H; // seed mid-screen on init
      spores.push(s);
    }
  }

  /* ── Colour tables ── */
  const EMERALD = { r: 61,  g: 219, b: 126 };
  const GOLD    = { r: 201, g: 168, b: 76  };

  function rgba(col, alpha) {
    return `rgba(${col.r},${col.g},${col.b},${alpha.toFixed(3)})`;
  }

  /* ── Grid lines (very subtle data-grid feel) ── */
  function drawGrid() {
    const step = 90;
    ctx.strokeStyle = 'rgba(61,219,126,0.025)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < W; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = 0; y < H; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  }

  /* ── Radial ambient glow ── */
  function drawAmbient() {
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.6, 0, W * 0.5, H * 0.6, Math.max(W, H) * 0.6);
    grd.addColorStop(0,   'rgba(10, 40, 18, 0.9)');
    grd.addColorStop(0.5, 'rgba(7, 16, 9, 0.96)');
    grd.addColorStop(1,   'rgba(5, 10, 6, 1)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── Draw single spore ── */
  function drawSpore(s) {
    const col    = s.type === 'emerald' ? EMERALD : GOLD;
    const pulse  = Math.sin(s.pulse) * 0.35;
    const alpha  = Math.max(0, s.opacity + pulse * 0.2);

    // Trail
    if (s.trail.length > 1) {
      for (let i = 1; i < s.trail.length; i++) {
        const t = i / s.trail.length;
        const ta = alpha * t * 0.4;
        ctx.beginPath();
        ctx.arc(s.trail[i].x, s.trail[i].y, s.radius * t * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = rgba(col, ta);
        ctx.fill();
      }
    }

    // Outer glow
    const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 4.5);
    grd.addColorStop(0,   rgba(col, alpha * 0.7));
    grd.addColorStop(0.4, rgba(col, alpha * 0.2));
    grd.addColorStop(1,   rgba(col, 0));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 4.5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = rgba(col, Math.min(1, alpha * 1.6));
    ctx.fill();
  }

  /* ── Tick ── */
  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawAmbient();
    drawGrid();

    spores.forEach(s => {
      // Record trail
      s.trail.unshift({ x: s.x, y: s.y });
      if (s.trail.length > s.maxTrail) s.trail.pop();

      // Move
      s.y    -= s.speedY;
      s.x    += s.speedX + Math.sin(s.pulse * 0.8) * 0.18;
      s.pulse += s.pulseSpd;

      // Slight horizontal drift boundaries
      if (s.x < -20)  s.x = W + 20;
      if (s.x > W+20) s.x = -20;

      // Reset when off top
      if (s.y < -20) {
        Object.assign(s, createSpore(0));
        s.trail = [];
      }

      drawSpore(s);
    });

    rafId = requestAnimationFrame(tick);
  }

  /* ── Init ── */
  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 14000), 90);
    buildSpores(count);
    tick();
  }

  window.addEventListener('resize', () => {
    resize();
    // Rebuild if count would change significantly
    const idealCount = Math.min(Math.floor((W * H) / 14000), 90);
    if (Math.abs(spores.length - idealCount) > 10) {
      buildSpores(idealCount);
    }
  });

  init();
})();


/* ──────────────────────────────────────────
   2. LIVE TELEMETRY SIMULATION
────────────────────────────────────────── */
const Telemetry = (() => {
  // Base values for mock IoT data
  let state = {
    temp:  4.2,
    humid: 67.1,
    co2:   412,
    soil:  71.4,
  };

  // Small random walk for realism
  function jitter(val, range, min, max) {
    const delta = (Math.random() - 0.5) * range;
    return Math.min(max, Math.max(min, val + delta));
  }

  function tick() {
    state.temp  = jitter(state.temp,  0.18, 1.5, 9.5);
    state.humid = jitter(state.humid, 0.40, 40,  90);
    state.co2   = jitter(state.co2,   3.5,  380, 850);
    state.soil  = jitter(state.soil,  0.55, 50,  95);
    return { ...state };
  }

  function format(n, dec = 1) {
    return n.toFixed(dec);
  }

  return { tick, format, state };
})();

// Strip telemetry (login view) — updates every 2s
let stripInterval = null;

function updateStrip() {
  const d = Telemetry.tick();
  const el = (id) => document.getElementById(id);
  el('stripTemp').textContent  = Telemetry.format(d.temp);
  el('stripHumid').textContent = Telemetry.format(d.humid);
  el('stripCO2').textContent   = Math.round(d.co2);
}

function startStrip() {
  updateStrip();
  stripInterval = setInterval(updateStrip, 2200);
}

// Dashboard telemetry (success view)
let dashInterval = null;

function updateDashboard() {
  const d = Telemetry.tick();
  const el = (id) => document.getElementById(id);

  el('dashTemp').textContent  = Telemetry.format(d.temp);
  el('dashHumid').textContent = Telemetry.format(d.humid);
  el('dashCO2').textContent   = Math.round(d.co2);
  el('dashLight').textContent = Telemetry.format(d.soil);

  // Animate bars — normalize to 0–100% within expected ranges
  const pct = (val, min, max) => Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
  document.getElementById('tempBar').style.width  = pct(d.temp,  0,   12)  + '%';
  document.getElementById('humidBar').style.width = pct(d.humid, 40,  90)  + '%';
  document.getElementById('co2Bar').style.width   = pct(d.co2,   350, 900) + '%';
  document.getElementById('lightBar').style.width = pct(d.soil,  45,  95)  + '%';
}

function startDashboard() {
  updateDashboard();
  dashInterval = setInterval(updateDashboard, 1800);
}

function stopDashboard() {
  clearInterval(dashInterval);
  dashInterval = null;
}


/* ──────────────────────────────────────────
   3. IOT NODE RENDERING
────────────────────────────────────────── */
const NODES = [
  { id: 'UNIT-07', status: 'online', label: 'Bay A · Climate' },
  { id: 'UNIT-08', status: 'online', label: 'Bay B · Climate' },
  { id: 'UNIT-09', status: 'online', label: 'Bay C · Humidity' },
  { id: 'UNIT-12', status: 'online', label: 'Irrigation Ctrl' },
  { id: 'UNIT-15', status: 'warn',   label: 'Bay D · CO₂' },
  { id: 'UNIT-19', status: 'online', label: 'Soil Sensor A' },
  { id: 'UNIT-20', status: 'online', label: 'Soil Sensor B' },
  { id: 'UNIT-24', status: 'online', label: 'Gate Cam' },
  { id: 'UNIT-27', status: 'warn',   label: 'Bay E · Temp' },
  { id: 'UNIT-31', status: 'online', label: 'Ventilation' },
  { id: 'UNIT-38', status: 'online', label: 'Cold Store A' },
  { id: 'UNIT-41', status: 'online', label: 'Cold Store B' },
];

function renderNodes() {
  const list = document.getElementById('nodeList');
  list.innerHTML = '';
  NODES.forEach((node, i) => {
    const chip = document.createElement('div');
    chip.className = `node-chip ${node.status}`;
    chip.style.animationDelay = `${i * 55}ms`;
    chip.innerHTML = `
      <span class="node-chip-dot"></span>
      <span>${node.id}</span>
      <span style="opacity:0.45;font-size:0.55rem">${node.label}</span>
    `;
    list.appendChild(chip);
  });
}


/* ──────────────────────────────────────────
   4. SESSION TIMER
────────────────────────────────────────── */
let sessionStart = null;
let sessionTimer = null;

function startSession() {
  sessionStart = Date.now();
  sessionTimer = setInterval(() => {
    const elapsed = Date.now() - sessionStart;
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('sessionTime').textContent =
      `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, 1000);
}

function stopSession() {
  clearInterval(sessionTimer);
  sessionTimer = null;
  sessionStart = null;
}


/* ──────────────────────────────────────────
   5. VIEW NAVIGATION (same-page)
────────────────────────────────────────── */
const loginView   = document.getElementById('loginView');
const successView = document.getElementById('successView');

function showView(show, hide) {
  // Exit animation on hide
  hide.classList.remove('active');
  hide.classList.add('exit');

  setTimeout(() => {
    hide.classList.remove('exit');
    show.classList.add('active');
  }, 420);
}

function goToSuccess() {
  showView(successView, loginView);
  clearInterval(stripInterval);

  // Slight delay for content to populate
  setTimeout(() => {
    renderNodes();
    startDashboard();
    startSession();
  }, 500);
}

function goToLogin() {
  showView(loginView, successView);
  stopDashboard();
  stopSession();

  // Reset form
  document.getElementById('loginForm').reset();
  clearError();

  // Restart strip
  startStrip();
}


/* ──────────────────────────────────────────
   6. AUTHENTICATION
────────────────────────────────────────── */
const VALID_USER = 'admin';
const VALID_PASS = '1234';

const loginForm = document.getElementById('loginForm');
const loginBtn  = document.getElementById('loginBtn');
const errorMsg  = document.getElementById('errorMsg');

function showError(msg) {
  errorMsg.textContent = '⚠ ' + msg;
  errorMsg.classList.add('visible');

  // Shake the form card
  const card = loginView.querySelector('.card');
  card.classList.remove('shake');
  void card.offsetWidth; // reflow to retrigger
  card.classList.add('shake');

  // Flash border on inputs red-ish
  [document.getElementById('username'), document.getElementById('password')].forEach(inp => {
    inp.style.borderColor = 'rgba(224,123,84,0.6)';
    inp.style.boxShadow   = '0 0 0 3px rgba(224,123,84,0.12)';
    setTimeout(() => {
      inp.style.borderColor = '';
      inp.style.boxShadow   = '';
    }, 800);
  });

  setTimeout(() => { card.classList.remove('shake'); }, 600);
}

function clearError() {
  errorMsg.classList.remove('visible');
  errorMsg.textContent = '';
}

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();                   // ← No page reload
  clearError();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showError('Both fields are required.');
    return;
  }

  // Simulate a brief "connecting" state
  loginBtn.classList.add('loading');

  setTimeout(() => {
    loginBtn.classList.remove('loading');

    if (username === VALID_USER && password === VALID_PASS) {
      goToSuccess();
    } else {
      showError('Invalid credentials. Access denied.');
    }
  }, 900);
});

// Clear error on any input
document.getElementById('username').addEventListener('input', clearError);
document.getElementById('password').addEventListener('input', clearError);

// Logout button
document.getElementById('logoutBtn').addEventListener('click', goToLogin);

// Password visibility toggle
document.getElementById('togglePwd').addEventListener('click', function() {
  const inp = document.getElementById('password');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.innerHTML = `
      <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" stroke="currentColor" stroke-width="1.3"/>
      <path d="M6 10 L14 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    `;
  } else {
    inp.type = 'password';
    icon.innerHTML = `
      <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" stroke="currentColor" stroke-width="1.3"/>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.3"/>
    `;
  }
});


/* ──────────────────────────────────────────
   7. BOOT SEQUENCE
────────────────────────────────────────── */
(function boot() {
  // Start login strip updates
  startStrip();

  // Ensure login view is visible on load
  loginView.classList.add('active');
})();