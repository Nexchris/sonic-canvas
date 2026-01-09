const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 360;

const SonicTitle = new Image();
SonicTitle.src = "../image/misc/sonicTitle.png";

const SelectImage = new Image();
SelectImage.src = "../image/misc/selectMenu.png";

let sonicLoaded = false;
let selectLoaded = false;

SonicTitle.onload = () => {
  sonicLoaded = true;
  if (selectLoaded) selectScreen();
};

SelectImage.onload = () => {
  selectLoaded = true;
  if (sonicLoaded) selectScreen();
};

export function selectScreen() {
  // --- Dégradé de fond ---
  const grad = ctx.createLinearGradient(0, 0, 280, 0);
  grad.addColorStop(0, "#5de0e6");
  grad.addColorStop(1, "#004aad");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Images ---
  ctx.drawImage(SelectImage, 0, 0, 1280/2, 720/2);
 }
