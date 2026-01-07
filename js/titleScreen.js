const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 360;

const title = {
  width: 879,
  height: 209
};

ctx.font = "20px SEGA";
ctx.fillStyle = "white";

const backgroundImage = new Image();
const SonicTitle = new Image();

backgroundImage.src = "../image/background/titleScreen1.png" ;
SonicTitle.src = "../image/misc/sonicTitle.png";

let backgroundLoaded = false;
let titleLoaded = false;

backgroundImage.onload = () => {
  backgroundLoaded = true;
  if (titleLoaded) titleScreen();
};

SonicTitle.onload = () => {
  titleLoaded = true;
  if (backgroundLoaded) titleScreen();
};


function titleScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

}