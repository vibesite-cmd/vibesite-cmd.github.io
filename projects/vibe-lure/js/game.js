const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let W, H;
let player = { x: 0, y: 0, r: 12 };
let orbs = [];
let enemies = [];
let particles = [];
let score = 0;
let startTime = Date.now();
let gameOver = false;
let mouseX = 0, mouseY = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  if (player.x === 0) {
    player.x = W / 2;
    player.y = H / 2;
  }
}
window.addEventListener('resize', resize);
resize();

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
  if (gameOver) restart();
});

function spawnOrb() {
  orbs.push({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 6,
    pulse: Math.random() * Math.PI * 2
  });
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  if (side === 0) { x = Math.random() * W; y = -20; }
  else if (side === 1) { x = W + 20; y = Math.random() * H; }
  else if (side === 2) { x = Math.random() * W; y = H + 20; }
  else { x = -20; y = Math.random() * H; }

  enemies.push({
    x, y,
    r: 7,
    speed: 1.2 + Math.random() * 0.8,
    angle: 0
  });
}

function createParticles(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30 + Math.random() * 20,
      color,
      size: 2 + Math.random() * 2
    });
  }
}

function update() {
  if (gameOver) return;

  // Move player toward mouse with smoothing
  const dx = mouseX - player.x;
  const dy = mouseY - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 1) {
    player.x += dx / dist * 5;
    player.y += dy / dist * 5;
  }

  // Clamp player
  player.x = Math.max(player.r, Math.min(W - player.r, player.x));
  player.y = Math.max(player.r, Math.min(H - player.r, player.y));

  // Spawn orbs
  if (Math.random() < 0.04 && orbs.length < 8) spawnOrb();

  // Spawn enemies (increase over time)
  const time = (Date.now() - startTime) / 1000;
  const spawnRate = Math.min(0.035, 0.012 + time * 0.0008);
  if (Math.random() < spawnRate) spawnEnemy();

  // Update orbs
  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i];
    o.pulse += 0.08;
    const dx = player.x - o.x;
    const dy = player.y - o.y;
    if (dx * dx + dy * dy < (player.r + o.r) * (player.r + o.r)) {
      score += 10;
      createParticles(o.x, o.y, '#a7f3d0', 8);
      orbs.splice(i, 1);
    }
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    e.x += (dx / dist) * e.speed;
    e.y += (dy / dist) * e.speed;

    // Collision with player
    const pdx = player.x - e.x;
    const pdy = player.y - e.y;
    if (pdx * pdx + pdy * pdy < (player.r + e.r) * (player.r + e.r)) {
      createParticles(player.x, player.y, '#fca5a5', 20);
      gameOver = true;
      setTimeout(() => {
        const msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#e8dcc8;font-family:JetBrains Mono,monospace;text-align:center;z-index:100';
        msg.innerHTML = `<div style="font-size:32px;color:#dc2626;margin-bottom:8px">LURED</div>
                         <div>Score: ${score}</div>
                         <div style="margin-top:20px;font-size:12px;opacity:0.6">Click anywhere to try again</div>`;
        document.body.appendChild(msg);
        document.addEventListener('click', function restartHandler() {
          document.removeEventListener('click', restartHandler);
          msg.remove();
          restart();
        }, { once: true });
      }, 120);
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04;
    p.life -= 1;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function draw() {
  ctx.fillStyle = '#08050a';
  ctx.fillRect(0, 0, W, H);

  // Subtle background fog
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#3a2d33';
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // Orbs
  orbs.forEach(o => {
    const s = Math.sin(o.pulse) * 0.3 + 1;
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(16,185,129,0.3)';
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r * s * 1.6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Enemies
  enemies.forEach(e => {
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(e.x, e.y - e.r * 1.3);
    ctx.lineTo(e.x - e.r, e.y + e.r * 0.8);
    ctx.lineTo(e.x + e.r, e.y + e.r * 0.8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(e.x, e.y + 2, e.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Player (lure)
  const grad = ctx.createRadialGradient(player.x, player.y, 2, player.x, player.y, player.r * 2.2);
  grad.addColorStop(0, '#fbbf24');
  grad.addColorStop(0.6, '#f59e0b');
  grad.addColorStop(1, 'rgba(251,191,36,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r * 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e8dcc8';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // Particles
  particles.forEach(p => {
    ctx.globalAlpha = p.life / 40;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // HUD
  const time = Math.floor((Date.now() - startTime) / 1000);
  ctx.fillStyle = '#e8dcc8';
  ctx.font = '14px JetBrains Mono, monospace';
  ctx.fillText(`SCORE ${score}`, 20, 28);
  ctx.fillText(`TIME ${time}s`, 20, 48);
}

function loop() {
  if (!gameOver) {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}

function restart() {
  orbs = [];
  enemies = [];
  particles = [];
  score = 0;
  startTime = Date.now();
  gameOver = false;
  player.x = W / 2;
  player.y = H / 2;
  for (let i = 0; i < 5; i++) spawnOrb();
  for (let i = 0; i < 3; i++) spawnEnemy();
}

function init() {
  resize();
  player.x = W / 2;
  player.y = H / 2;
  for (let i = 0; i < 6; i++) spawnOrb();
  for (let i = 0; i < 4; i++) spawnEnemy();
  startTime = Date.now();
  loop();
}

init();
