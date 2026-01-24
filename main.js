const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Base resolution (Dan The Man style)
const BASE_W = 640;
const BASE_H = 360;

function resize() {
  canvas.width = BASE_W;
  canvas.height = BASE_H;
}
resize();

// ================= GAME STATE =================
let gameState = "menu";

// ================= MENU =================
const menu = document.getElementById("menu");
const playMenu = document.getElementById("playMenu");
const customMenu = document.getElementById("customMenu");

document.getElementById("playBtn").onclick = () => {
  playMenu.style.display = playMenu.style.display === "flex" ? "none" : "flex";
};

document.getElementById("customBtn").onclick = () => {
  customMenu.style.display = customMenu.style.display === "flex" ? "none" : "flex";
};

document.querySelectorAll("[data-mode]").forEach(btn => {
  btn.onclick = () => {
    gameState = btn.dataset.mode;
    menu.style.display = "none";
  };
});

// ================= INPUT =================
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// ================= LOAD SPRITES =================
const load = src => {
  const i = new Image();
  i.src = src;
  return i;
};

const dan = {
  idle: load("assets/sprites/dan_idle.png"),
  walk: load("assets/sprites/dan_walk.png"),
  punch: load("assets/sprites/dan_punch.png"),
  jump: load("assets/sprites/dan_jump.png")
};

const enemySprites = {
  run: load("assets/sprites/baton_guard_enemy_run.png"),
  dead: load("assets/sprites/baton_guard_enemy_died.png")
};

// ================= PLAYER =================
const player = { x: 100, y: 260, vx: 0, vy: 0, grounded: true, sprite: dan.idle };
const enemy = { x: 450, y: 260, alive: true };

// ================= UPDATE =================
function update() {
  player.vx = 0;

  if (keys["ArrowLeft"]) {
    player.vx = -2;
    player.sprite = dan.walk;
  } else if (keys["ArrowRight"]) {
    player.vx = 2;
    player.sprite = dan.walk;
  } else {
    player.sprite = dan.idle;
  }

  if (keys["x"] && player.grounded) {
    player.vy = -6;
    player.grounded = false;
    player.sprite = dan.jump;
  }

  if (keys["z"]) {
    player.sprite = dan.punch;
    if (Math.abs(player.x - enemy.x) < 40) enemy.alive = false;
  }

  player.x += player.vx;
  player.y += player.vy;
  player.vy += 0.35;

  if (player.y >= 260) {
    player.y = 260;
    player.vy = 0;
    player.grounded = true;
  }

  if (enemy.alive) enemy.x -= 0.4;
}

// ================= DRAW =================
function draw() {
  ctx.clearRect(0, 0, BASE_W, BASE_H);

  ctx.drawImage(player.sprite, player.x, player.y, 48, 48);

  if (enemy.alive) {
    ctx.drawImage(enemySprites.run, enemy.x, enemy.y, 48, 48);
  } else {
    ctx.drawImage(enemySprites.dead, enemy.x, enemy.y, 48, 48);
  }
}

// ================= LOOP =================
function loop() {
  if (gameState !== "menu") {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}
loop();
