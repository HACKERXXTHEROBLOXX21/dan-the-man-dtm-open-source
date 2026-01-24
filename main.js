const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const BASE_W = 640;
const BASE_H = 360;

canvas.width = BASE_W;
canvas.height = BASE_H;

// ================= STATES =================
let state = "menu";
let cameraX = 0;

// ================= FULLSCREEN =================
window.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "f") {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
});

// ================= INPUT =================
const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

// MOBILE
["left","right","jump","punch"].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener("touchstart", () => keys[id] = true);
  el.addEventListener("touchend", () => keys[id] = false);
});

// ================= SPRITES =================
const load = s => { const i=new Image(); i.src=s; return i; };

const danSprites = {
  idle: load("assets/sprites/dan_idle.png"),
  walk: load("assets/sprites/dan_walk.png"),
  punch: load("assets/sprites/dan_punch.png"),
  jump: load("assets/sprites/dan_jump.png")
};

// ================= PLAYER =================
const player = {
  x: 100,
  y: 260,
  vx: 0,
  vy: 0,
  grounded: true,
  sprite: danSprites.idle
};

// ================= LEVEL =================
const tileSize = 32;
const level = []; // blocks placed in editor

// ================= START =================
function startGame(mode) {
  state = mode;
  document.getElementById("menu").style.display = "none";
}

// ================= UPDATE =================
function update() {
  player.vx = 0;

  const left = keys["ArrowLeft"] || keys.left;
  const right = keys["ArrowRight"] || keys.right;

  if (left) {
    player.vx = -2;
    player.sprite = danSprites.walk;
  } else if (right) {
    player.vx = 2;
    player.sprite = danSprites.walk;
  } else {
    player.sprite = danSprites.idle;
  }

  if ((keys["x"] || keys.jump) && player.grounded) {
    player.vy = -6;
    player.grounded = false;
    player.sprite = danSprites.jump;
  }

  if (keys["z"] || keys.punch) {
    player.sprite = danSprites.punch;
  }

  player.x += player.vx;
  player.y += player.vy;
  player.vy += 0.3;

  if (player.y >= 260) {
    player.y = 260;
    player.vy = 0;
    player.grounded = true;
  }

  cameraX = player.x - BASE_W / 2;
}

// ================= LEVEL EDITOR =================
canvas.addEventListener("click", e => {
  if (state !== "create") return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize) * tileSize + cameraX;
  const y = Math.floor((e.clientY - rect.top) / tileSize) * tileSize;

  level.push({ x, y });
});

// ================= DRAW =================
function draw() {
  ctx.clearRect(0, 0, BASE_W, BASE_H);

  ctx.save();
  ctx.translate(-cameraX, 0);

  // blocks
  ctx.fillStyle = "#444";
  level.forEach(b => ctx.fillRect(b.x, b.y, tileSize, tileSize));

  ctx.drawImage(player.sprite, player.x, player.y, 48, 48);

  ctx.restore();

  // grid (editor)
  if (state === "create") {
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    for (let x=0;x<BASE_W;x+=tileSize)
      for (let y=0;y<BASE_H;y+=tileSize)
        ctx.strokeRect(x,y,tileSize,tileSize);
  }
}

// ================= LOOP =================
function loop() {
  if (state !== "menu") {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}
loop();
