const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 360;

ctx.font = "20px SEGA";
ctx.fillStyle = "white";

const backgroundImage = new Image();
const Clickaudio = new Audio("../audio/sfx/click.wav");

backgroundImage.onload = () => {
  console.log("✅ Background chargé !");
  titleScreen();
};
backgroundImage.onerror = () => {
  console.error("❌ Impossible de charger le background !");
};

Clickaudio.addEventListener("canplaythrough", () => {
  console.log("✅ Audio Click chargé !");
});
Clickaudio.onerror = () => {
  console.error("❌ Impossible de charger l'audio Click !");
};

backgroundImage.src = "../image/background/titleScreen.png";

function titleScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

export function startSelectPlayer() {
  Clickaudio.play();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.removeEventListener("click", startSelectPlayer);
  import("./selectPlayer.js").then(module => {
    module.selectPlayer();
  });
}

canvas.addEventListener("click", startSelectPlayer);
