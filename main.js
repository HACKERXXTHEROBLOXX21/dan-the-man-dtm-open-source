const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

const TILE = 32;
const gravity = 0.7;

// ---------- LOAD ----------
const img = src => {
  const i = new Image();
  i.src = src;
  return i;
};

const sprites = {
  dan: {
    idle: img("sprites/dan_idle.png"),
    walk: img("sprites/dan_walk.png"),
    jump: img("sprites/dan_jump.png"),
    punch: img("sprites/dan_punch.png")
  },
  enemy: {
    run: img("sprites/baton_guard_enemy_run.png"),
    dead: img("sprites/baton_guard_enemy_died.png")
  },
  coin: img("sprites/coin.png"),
  tile: img("sprites/tile_ground.png")
};

// ---------- LEVEL (TILES) ----------
const level = [
  "........................",
  "........................",
  "........................",
  "............C...........",
  "........#####...........",
  "....................E...",
  "########################"
];

// ---------- PLAYER ----------
const dan = {
  x: 100, y: 0, w: 28, h: 28,
  vx: 0, vy: 0,
  facing: 1,
  onGround: false,
  punching: false,
  coins: 0
};

// ---------- ENEMY ----------
const enemy = {
  x: 0, y: 0, w: 28, h: 28,
  hp: 3,
  alive: true
};

// ---------- INPUT ----------
const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

// ---------- COLLISION ----------
function rect(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// ---------- TILE COLLISION ----------
function isSolid(x, y) {
  const col = Math.floor(x / TILE);
  const row = Math.floor(y / TILE);
  return level[row]?.[col] === "#";
}

// ---------- UPDATE ----------
function update() {
  dan.vx = 0;

  if (keys.ArrowLeft) {
    dan.vx = -4;
    dan.facing = -1;
  }
  if (keys.ArrowRight) {
    dan.vx = 4;
    dan.facing = 1;
  }
  if (keys.x && dan.onGround) {
    dan.vy = -14;
  }
  dan.punching = keys.z;

  dan.vy += gravity;

  dan.x += dan.vx;
  if (isSolid(dan.x, dan.y) || isSolid(dan.x + dan.w, dan.y)) {
    dan.x -= dan.vx;
  }

  dan.y += dan.vy;
  dan.onGround = false;
  if (isSolid(dan.x, dan.y + dan.h)) {
    dan.y = Math.floor((dan.y + dan.h) / TILE) * TILE - dan.h;
    dan.vy = 0;
    dan.onGround = true;
  }

  // ---------- ENEMY AI ----------
  if (enemy.alive) {
    enemy.vx = dan.x < enemy.x ? -2 : 2;
    enemy.x += enemy.vx;
  }

  // ---------- PUNCH ----------
  if (dan.punching && enemy.alive) {
    const hitbox = {
      x: dan.x + (dan.facing === 1 ? dan.w : -20),
      y: dan.y + 10,
      w: 20,
      h: 10
    };
    if (rect(hitbox, enemy)) {
      enemy.hp--;
      if (enemy.hp <= 0) enemy.alive = false;
    }
  }
}

// ---------- DRAW ----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Camera
  ctx.save();
  ctx.translate(-dan.x + canvas.width / 2, 0);

  // Tiles
  level.forEach((row, y) => {
    [...row].forEach((t, x) => {
      if (t === "#")
        ctx.drawImage(sprites.tile, x*TILE, y*TILE, TILE, TILE);
      if (t === "C")
        ctx.drawImage(sprites.coin, x*TILE, y*TILE, 16, 16);
      if (t === "E") {
        enemy.x = x*TILE;
        enemy.y = y*TILE - 10;
      }
    });
  });

  // Enemy
  ctx.drawImage(
    enemy.alive ? sprites.enemy.run : sprites.enemy.dead,
    enemy.x, enemy.y, enemy.w, enemy.h
  );

  // Dan
  let s = sprites.dan.idle;
  if (!dan.onGround) s = sprites.dan.jump;
  else if (dan.punching) s = sprites.dan.punch;
  else if (dan.vx) s = sprites.dan.walk;

  ctx.save();
  if (dan.facing === -1) {
    ctx.scale(-1, 1);
    ctx.drawImage(s, -dan.x-dan.w, dan.y, dan.w, dan.h);
  } else {
    ctx.drawImage(s, dan.x, dan.y, dan.w, dan.h);
  }
  ctx.restore();

  ctx.restore();

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "16px sans-serif";
  ctx.fillText(`Coins: ${dan.coins}`, 20, 30);
}

// ---------- LOOP ----------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
