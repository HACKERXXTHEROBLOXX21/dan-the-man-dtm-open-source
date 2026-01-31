const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* =======================
   INPUT
======================= */
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

/* =======================
   LOAD IMAGES
======================= */
function img(src) {
  const i = new Image();
  i.src = src;
  return i;
}

const sprites = {
  danIdle: img("assets/sprites/dan_idle.png"),
  danWalk: img("assets/sprites/dan_walk.png"),
  danJump: img("assets/sprites/dan_jump.png"),
  ground: img("assets/sprites/title_ground.png"),
  coin: img("assets/sprites/coin.png"),
  enemyIdle: img("assets/sprites/baton_guard_enemy_idle.png"),
  enemyRun: img("assets/sprites/baton_guard_enemy_run.png")
};

/* =======================
   PLAYER
======================= */
const player = {
  x: 200,
  y: 0,
  w: 48,
  h: 48,
  vx: 0,
  vy: 0,
  speed: 5,
  jump: -14,
  onGround: false,
  facing: 1
};

const gravity = 0.8;
const groundY = canvas.height - 120;

/* =======================
   COINS
======================= */
const coins = [
  { x: 400, y: groundY - 40, collected: false },
  { x: 550, y: groundY - 40, collected: false }
];

/* =======================
   ENEMY
======================= */
const enemy = {
  x: 700,
  y: groundY - 48,
  w: 48,
  h: 48,
  vx: -1
};

/* =======================
   MIDI + SOUNDFONT
======================= */
let audioCtx = new AudioContext();
let instrument = null;
let midiData = null;

Soundfont.instrument(
  audioCtx,
  "assets/audio/Super_Nintendo_Unofficial_Soundfont.sf2"
).then(inst => instrument = inst);

document.getElementById("midiFile").addEventListener("change", e => {
  const reader = new FileReader();
  reader.onload = () => midiData = reader.result;
  reader.readAsArrayBuffer(e.target.files[0]);
});

document.getElementById("playMidi").onclick = () => {
  if (!instrument || !midiData) return;
  instrument.play(midiData);
};

/* =======================
   GAME LOOP
======================= */
function update() {
  // Movement
  player.vx = 0;
  if (keys["ArrowLeft"]) {
    player.vx = -player.speed;
    player.facing = -1;
  }
  if (keys["ArrowRight"]) {
    player.vx = player.speed;
    player.facing = 1;
  }
  if (keys["x"] && player.onGround) {
    player.vy = player.jump;
    player.onGround = false;
  }

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // Ground collision
  if (player.y + player.h >= groundY) {
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  // Enemy AI
  enemy.x += enemy.vx;
  if (enemy.x < 600 || enemy.x > 900) enemy.vx *= -1;

  // Coin collection
  coins.forEach(c => {
    if (!c.collected &&
        player.x < c.x + 24 &&
        player.x + player.w > c.x &&
        player.y < c.y + 24 &&
        player.y + player.h > c.y) {
      c.collected = true;
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.drawImage(sprites.ground, 0, groundY, canvas.width, 120);

  // Coins
  coins.forEach(c => {
    if (!c.collected) ctx.drawImage(sprites.coin, c.x, c.y, 24, 24);
  });

  // Enemy
  ctx.drawImage(sprites.enemyRun, enemy.x, enemy.y, enemy.w, enemy.h);

  // Player (flip)
  ctx.save();
  ctx.translate(player.x + player.w / 2, player.y);
  ctx.scale(player.facing, 1);
  ctx.drawImage(
    sprites.danWalk,
    -player.w / 2,
    0,
    player.w,
    player.h
  );
  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
