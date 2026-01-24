const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const gravity = 0.6;
const keys = {};

// ---------- LOAD IMAGES ----------
function load(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const dan = {
  x: 100,
  y: 300,
  w: 32,
  h: 32,
  vx: 0,
  vy: 0,
  facing: 1,
  onGround: false,
  punching: false,
  frame: 0,
  tick: 0,
  sprites: {
    idle: load("sprites/dan_idle.png"),
    walk: load("sprites/dan_walk.png"),
    jump: load("sprites/dan_jump.png"),
    punch: load("sprites/dan_punch.png")
  }
};

// ---------- ENEMY ----------
const enemy = {
  x: 500,
  y: 368,
  w: 32,
  h: 32,
  hp: 3,
  alive: true,
  img: load("sprites/baton_guard_enemy_run.png"),
  dead: load("sprites/baton_guard_enemy_died.png")
};

// ---------- PLATFORMS ----------
const platforms = [
  { x: 0, y: canvas.height - 40, w: canvas.width, h: 40 }
];

// ---------- INPUT ----------
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

// Mobile buttons
left.onclick = () => keys["ArrowLeft"] = true;
right.onclick = () => keys["ArrowRight"] = true;
jump.onclick = () => keys["x"] = true;
punch.onclick = () => keys["z"] = true;

// ---------- COLLISION ----------
function hit(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// ---------- UPDATE ----------
function update() {
  dan.vx = 0;

  if (keys["ArrowLeft"]) {
    dan.vx = -4;
    dan.facing = -1;
  }
  if (keys["ArrowRight"]) {
    dan.vx = 4;
    dan.facing = 1;
  }

  if (keys["x"] && dan.onGround) {
    dan.vy = -12;
    dan.onGround = false;
  }

  dan.punching = keys["z"];

  dan.vy += gravity;
  dan.x += dan.vx;
  dan.y += dan.vy;

  dan.onGround = false;
  platforms.forEach(p => {
    if (hit(dan, p) && dan.vy > 0) {
      dan.y = p.y - dan.h;
      dan.vy = 0;
      dan.onGround = true;
    }
  });

  // Punch hitbox
  if (dan.punching && enemy.alive) {
    const punchBox = {
      x: dan.x + (dan.facing === 1 ? dan.w : -20),
      y: dan.y + 10,
      w: 20,
      h: 12
    };
    if (hit(punchBox, enemy)) {
      enemy.hp--;
      if (enemy.hp <= 0) enemy.alive = false;
    }
  }

  dan.tick++;
  if (dan.tick > 8) {
    dan.frame = (dan.frame + 1) % 4;
    dan.tick = 0;
  }
}

// ---------- DRAW ----------
function drawSprite(img, x, y, w, h, flip) {
  ctx.save();
  if (flip) {
    ctx.scale(-1, 1);
    ctx.drawImage(img, -x - w, y, w, h);
  } else {
    ctx.drawImage(img, x, y, w, h);
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Platforms
  ctx.fillStyle = "#222";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  // Enemy
  drawSprite(enemy.alive ? enemy.img : enemy.dead,
    enemy.x, enemy.y, enemy.w, enemy.h, false);

  // Player sprite state
  let sprite = dan.sprites.idle;
  if (!dan.onGround) sprite = dan.sprites.jump;
  else if (dan.punching) sprite = dan.sprites.punch;
  else if (dan.vx !== 0) sprite = dan.sprites.walk;

  drawSprite(sprite, dan.x, dan.y, dan.w, dan.h, dan.facing === -1);
}

// ---------- MIDI + SOUNDFONT ----------
let audioCtx = new AudioContext();
let player;

sfUpload.onchange = async e => {
  const sf = e.target.files[0];
  player = await Soundfont.instrument(audioCtx, sf);
};

midiUpload.onchange = e => {
  if (!player) return alert("Upload SoundFont first!");
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => player.play(60);
  reader.readAsArrayBuffer(file);
};

// ---------- LOOP ----------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
