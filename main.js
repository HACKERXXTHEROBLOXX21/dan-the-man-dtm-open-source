const customBtn = document.getElementById("customBtn");
const customMenu = document.getElementById("customMenu");

let isOpen = false;

customBtn.addEventListener("click", () => {
  isOpen = !isOpen;
  customMenu.classList.toggle("hidden", !isOpen);
});

// Optional: preload font to avoid flicker
document.fonts.load("16px prstartk");
