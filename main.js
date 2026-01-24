const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 180;
ctx.imageSmoothingEnabled = false;

// SPRITES
const sprites = {
  idle:  { img: new Image(), frames: 4 },
  walk:  { img: new Image(), frames: 6 },
  punch: { img: new Image(), frames: 3 },
  jump:  { img: new Image(), frames: 1 }
};

sprites.idle.img.src  = "assets/sprites/dan_idle.png";
sprites.walk.img.src  = "assets/sprites/dan_walk.png";
sprites.punch.img.src = "assets/sprites/dan_punch.png";
sprites.jump.img.src  = "assets/sprites/dan_jump.png";

const FRAME_W = 32;
const FRAME_H = 32;

// PLAYER
let x = 140;
let y = 100;
let vx = 0;
let vy = 0;

const speed = 1.5;
const gravity = 0.35;
const jumpPower = -6;
const groundY = 120;

let onGround = true;
let state = "idle";
let frame = 0;
let frameTimer = 0;

// INPUT
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// UPDATE
function update() {
  vx = 0;

  // Jump
  if ((keys["ArrowUp"] || keys[" "]) && onGround) {
    vy = jumpPower;
    onGround = false;
  }

  // Punch overrides everything
  if (keys["z"] || keys["Z"]) {
    if (state !== "punch") {
      state = "punch";
      frame = 0;
    }
  }
  else if (!onGround) {
    state = "jump";
  }
  else if (keys["ArrowLeft"] || keys["ArrowRight"]) {
    state = "walk";
    if (keys["ArrowLeft"]) vx = -speed;
    if (keys["ArrowRight"]) vx = speed;
  }
  else {
    state = "idle";
  }

  // Physics
  x += vx;
  vy += gravity;
  y += vy;

  // Ground collision
  if (y >= groundY) {
    y = groundY;
    vy = 0;
    onGround = true;
  }

  // Animation
  frameTimer++;
  if (frameTimer > 8) {
    frame++;
    frameTimer = 0;

    if (frame >= sprites[state].frames) {
      frame = 0;
      if (state === "punch") state = "idle";
    }
  }
}

// DRAW
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sprite = sprites[state];

  ctx.drawImage(
    sprite.img,
    frame * FRAME_W, 0,
    FRAME_W, FRAME_H,
    Math.floor(x), Math.floor(y),
    FRAME_W, FRAME_H
  );
}

// LOOP
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// START
Promise.all(
  Object.values(sprites).map(s =>
    new Promise(res => s.img.onload = res)
  )
).then(loop);
