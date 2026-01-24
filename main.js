const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ======================
// LOAD IMAGES
// ======================
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

// Dan sprites
const dan = {
  x: 80,
  y: 260,
  w: 32,
  h: 32,
  vx: 0,
  onGround: true,
  state: "idle",
  sprites: {
    idle: loadImage("assets/sprites/dan_idle.png"),
    walk: loadImage("assets/sprites/dan_walk.png"),
    punch: loadImage("assets/sprites/dan_punch.png"),
    jump: loadImage("assets/sprites/dan_jump.png"),
  },
};

// Enemy
const enemy = {
  x: 480,
  y: 260,
  w: 32,
  h: 32,
  alive: true,
  state: "idle",
  sprites: {
    idle: loadImage("assets/sprites/baton_guard_enemy_idle.png"),
    run: loadImage("assets/sprites/baton_guard_enemy_run.png"),
    died: loadImage("assets/sprites/baton_guard_enemy_died.png"),
  },
};

// ======================
// INPUT
// ======================
const keys = {};

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// ======================
// MIDI MUSIC (SNES GM)
// ======================
MIDI.loadPlugin({
  soundfontUrl: "assets/audio/",
  instrument: "acoustic_grand_piano",
  onsuccess: () => {
    MIDI.setVolume(0, 80);
    MIDI.programChange(0, 0);
    // Simple looped melody
    let t = 0;
    setInterval(() => {
      MIDI.noteOn(0, 60, 80, t);
      MIDI.noteOff(0, 60, t + 0.3);
      t += 0.4;
    }, 400);
  }
});

// ======================
// GAME LOOP
// ======================
function update() {
  // Movement
  dan.vx = 0;
  dan.state = "idle";

  if (keys["ArrowRight"]) {
    dan.vx = 2;
    dan.state = "walk";
  }
  if (keys["ArrowLeft"]) {
    dan.vx = -2;
    dan.state = "walk";
  }

  if (keys["x"] && dan.onGround) {
    dan.onGround = false;
    dan.state = "jump";
  }

  if (keys["z"]) {
    dan.state = "punch";
    if (enemy.alive && Math.abs(dan.x - enemy.x) < 40) {
      enemy.alive = false;
      enemy.state = "died";
    }
  }

  dan.x += dan.vx;

  // Gravity
  if (!dan.onGround) {
    dan.y -= 4;
    if (dan.y <= 220) dan.onGround = true;
  } else {
    dan.y = 260;
  }

  // Enemy AI
  if (enemy.alive) {
    enemy.state = "run";
    enemy.x -= 0.6;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#3c8c3c";
  ctx.fillRect(0, 300, canvas.width, 60);

  // Enemy
  const eSprite = enemy.sprites[enemy.state];
  ctx.drawImage(eSprite, enemy.x, enemy.y, enemy.w, enemy.h);

  // Dan
  const dSprite = dan.sprites[dan.state];
  ctx.drawImage(dSprite, dan.x, dan.y, dan.w, dan.h);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
