const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ================== GAME STATE ==================
let gameState = "menu";

// ================== MENU ==================
const menu = document.getElementById("menu");
const playMenu = document.getElementById("playMenu");
const customMenu = document.getElementById("customMenu");

document.getElementById("playBtn").onclick = () => {
  playMenu.style.display = playMenu.style.display === "flex" ? "none" : "flex";
};

document.getElementById("customBtn").onclick = () => {
  customMenu.style.display =
    customMenu.style.display === "flex" ? "none" : "flex";
};

document.querySelectorAll("[data-mode]").forEach(btn => {
  btn.onclick = () => {
    gameState = btn.dataset.mode;
    menu.style.display = "none";
  };
});

// ================== INPUT ==================
const keys = {};
window.addEventListener("keydown", e => (keys[e.key] = true));
window.addEventListener("keyup", e => (keys[e.key] = false));

// ================== SPRITES ==================
function loadSprite(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const danSprites = {
  idle: loadSprite("assets/sprites/dan_idle.png"),
  walk: loadSprite("assets/sprites/dan_walk.png"),
  punch: loadSprite("assets/sprites/dan_punch.png"),
  jump: loadSprite("assets/sprites/dan_jump.png"),
};

const enemySprites = {
  idle: loadSprite("assets/sprites/baton_guard_enemy_idle.png"),
  run: loadSprite("assets/sprites/baton_guard_enemy_run.png"),
  dead: loadSprite("assets/sprites/baton_guard_enemy_died.png"),
};

// ================== PLAYER ==================
const player = {
  x: 100,
  y: 260,
  vx: 0,
  vy: 0,
  grounded: true,
  sprite: danSprites.idle,
};

const enemy = {
  x: 450,
  y: 260,
  alive: true,
  sprite: enemySprites.run,
};

// ================== UPDATE ==================
function update() {
  // PLAYER MOVE
  player.vx = 0;

  if (keys["ArrowLeft"]) {
    player.vx = -2;
    player.sprite = danSprites.walk;
  } else if (keys["ArrowRight"]) {
    player.vx = 2;
    player.sprite = danSprites.walk;
  } else {
    player.sprite = danSprites.idle;
  }

  if (keys["x"] && player.grounded) {
    player.vy = -6;
    player.grounded = false;
    player.sprite = danSprites.jump;
  }

  if (keys["z"]) {
    player.sprite = danSprites.punch;
    if (Math.abs(player.x - enemy.x) < 40) {
      enemy.alive = false;
    }
  }

  // PHYSICS
  player.x += player.vx;
  player.y += player.vy;
  player.vy += 0.3;

  if (player.y >= 260) {
    player.y = 260;
    player.vy = 0;
    player.grounded = true;
  }

  // ENEMY
  if (enemy.alive) {
    enemy.sprite = enemySprites.run;
    enemy.x -= 0.5;
  } else {
    enemy.sprite = enemySprites.dead;
  }
}

// ================== DRAW ==================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(player.sprite, player.x, player.y, 48, 48);
  ctx.drawImage(enemy.sprite, enemy.x, enemy.y, 48, 48);
}

// ================== LOOP ==================
function loop() {
  if (gameState !== "menu") {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}

loop();
