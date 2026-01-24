// ---------- CANVAS ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// ---------- INPUT ----------
const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

// Mobile buttons
["left","right","punch","jump"].forEach(id=>{
  const k = id === "left" ? "ArrowLeft" :
            id === "right" ? "ArrowRight" :
            id === "punch" ? "z" : "x";

  document.getElementById(id).onmousedown = () => keys[k] = true;
  document.getElementById(id).onmouseup = () => keys[k] = false;
});

// ---------- SPRITES ----------
const danImg = new Image();
danImg.src = "assets/sprites/dan_idle.png";

// ---------- PLAYER ----------
const dan = {
  x: 200, y: 300,
  vx: 0, vy: 0,
  facing: 1
};

// ---------- GAME LOOP ----------
function update() {
  dan.vx = 0;
  if (keys.ArrowLeft) { dan.vx = -4; dan.facing = -1; }
  if (keys.ArrowRight) { dan.vx = 4; dan.facing = 1; }

  dan.x += dan.vx;
}

function draw() {
  ctx.fillStyle = "#6bd66b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  if (dan.facing === -1) {
    ctx.scale(-1, 1);
    ctx.drawImage(danImg, -dan.x-32, dan.y, 32, 32);
  } else {
    ctx.drawImage(danImg, dan.x, dan.y, 32, 32);
  }
  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// ---------- MIDI + SF2 ----------
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let currentPlayer = null;
let currentSoundfont = null;

const midiPlayer = new MidiPlayer.Player(event => {
  if (event.name === "Note on" && currentSoundfont) {
    currentSoundfont.play(event.noteName, audioCtx.currentTime, {
      gain: event.velocity / 100,
      duration: 0.5
    });
  }
});

// Load MIDI
document.getElementById("midiInput").addEventListener("change", e => {
  const reader = new FileReader();
  reader.onload = () => midiPlayer.loadArrayBuffer(reader.result);
  reader.readAsArrayBuffer(e.target.files[0]);
});

// Load SF2
document.getElementById("sf2Input").addEventListener("change", async e => {
  const file = e.target.files[0];
  const url = URL.createObjectURL(file);
  currentSoundfont = await Soundfont.instrument(audioCtx, url);
  alert("SoundFont loaded!");
});

// Play
document.getElementById("playMidi").onclick = () => {
  audioCtx.resume();
  midiPlayer.play();
};
