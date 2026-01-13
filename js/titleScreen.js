const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 360;

ctx.font = "20px SEGA";
ctx.fillStyle = "white";

const backgroundImage = new Image();
const Clickaudio = new Audio("../music//sfx/click.wav");

backgroundImage.src = "../image/background/titleScreen.png";

backgroundImage.onload = () => {
  titleScreen();
};

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
