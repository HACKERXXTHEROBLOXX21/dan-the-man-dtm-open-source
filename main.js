// ---------- CANVAS ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ---------- MENU ----------
const menu = document.getElementById("menu");
const customMenu = document.getElementById("customMenu");
const midiInput = document.getElementById("midiInput");

// preload font
document.fonts.load("16px prstartk");

// ---------- AUDIO ----------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let instrument = null;

// SNES-style GM soundfont (logical name only)
// NOTE: Browsers can't directly load .sf2 yet
Soundfont.instrument(audioCtx, "acoustic_grand_piano").then(inst => {
  instrument = inst;
});

// ---------- MENU FUNCTIONS ----------
function toggleCustom() {
  customMenu.classList.toggle("hidden");
}

function startGame() {
  showReadyFight();
}

// ---------- READY / FIGHT ----------
function showReadyFight() {
  menu.style.display = "none";
  canvas.style.display = "block";

  let frame = 0;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "48px prstartk";

    if (frame < 60) {
      ctx.fillText("READY?", canvas.width / 2, canvas.height / 2);
    } else if (frame < 120) {
      ctx.fillText("FIGHT!", canvas.width / 2, canvas.height / 2);
    } else {
      startBattle();
      return;
    }

    frame++;
    requestAnimationFrame(loop);
  }

  loop();
}

// ---------- GAME LOOP ----------
let player = { x: 120, y: 320 };

function startBattle() {
  gameLoop();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = "#444";
  ctx.fillRect(0, 360, 800, 90);

  // player
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, 32, 32);

  requestAnimationFrame(gameLoop);
}

// ---------- STAGE EDITOR ----------
function openEditor() {
  menu.style.display = "none";
  canvas.style.display = "block";

  canvas.onclick = e => {
    const x = Math.floor(e.offsetX / 40) * 40;
    const y = Math.floor(e.offsetY / 40) * 40;
    ctx.fillStyle = "#666";
    ctx.fillRect(x, y, 40, 40);
  };
}

// ---------- CUSTOM LEVEL ----------
function loadCustomLevel() {
  menu.style.display = "none";
  canvas.style.display = "block";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "24px prstartk";
  ctx.textAlign = "center";
  ctx.fillText("CUSTOM LEVEL LOADED", canvas.width / 2, 100);
}

// ---------- MIDI UPLOAD ----------
function uploadMidi() {
  midiInput.click();
}

midiInput.addEventListener("change", () => {
  const file = midiInput.files[0];
  if (!file || !instrument) return;

  // Demo SNES-style playback (placeholder)
  const notes = ["C4", "E4", "G4", "C5"];
  notes.forEach((note, i) => {
    instrument.play(note, audioCtx.currentTime + i * 0.3, {
      duration: 0.25,
      gain: 0.8
    });
  });

  alert("MIDI LOADED!\n(SNES GM SoundFont Ready)");
});

