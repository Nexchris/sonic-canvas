
// =========================
// 🎮 CANVAS SETUP
// =========================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 360;
const loadingScreen = document.createElement("video");
loadingScreen.src = "../video/loadingScreen.mp4";
const victoryOverlay = document.getElementById("victoryOverlay");
const losingOverlay = document.getElementById("losingOverlay");
let gameState = "loading"; // "loading" | "game"
let lastTime = performance.now();
let heavyFXEnabled = false;
setTimeout(() => {
  heavyFXEnabled = true;
}, 2000);
let delta = 1;


ctx.fillStyle = '#b0b0b0';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// =========================
// 🎥 CAMERA
// =========================
let gameRunning = false;
let animationId = null;
let cameraX = 0;
let loadingFinished = false;
loadingScreen.muted = true;
loadingScreen.loop = true;
// =========================
// 🖼️ SPRITES PATHS
// =========================

const RingSheet = new Image();
RingSheet.src = '../image/assets/ring.png';

const idleSprites = [
  '../image/sprite/sonic/idle/idle_sonic_1.png',
'../image/sprite/sonic/idle/idle_sonic_2.png',
    '../image/sprite/sonic/idle/idle_sonic_3.png',
    '../image/sprite/sonic/idle/idle_sonic_4.png',
    '../image/sprite/sonic/idle/idle_sonic_5.png'
];

const GameBGM = new Audio("../music/bgm/gameSong.mp3");
const JumpSound = new Audio("../music/sfx/jumpsound.mp3");


const SonicTitle = new Image();
SonicTitle.src = "../image/misc/sonicTitle.png";

const homingSprites = [
  '../image/sprite/sonic/homing-sonic/homing_sonic_1.png',
  '../image/sprite/sonic/homing-sonic/homing_sonic_2.png',
  '../image/sprite/sonic/homing-sonic/homing_sonic_3.png'
];

const AxeSprite = new Image();
AxeSprite.src = '../image/sprite/sonic/axe/sonic-axe.png';

const FrontboostSprites = [
    '../image/sprite/sonic/frontboost-sonic/boost_sonic_1.png',
    '../image/sprite/sonic/frontboost-sonic/boost_sonic_2.png',
    '../image/sprite/sonic/frontboost-sonic/boost_sonic_3.png',
    '../image/sprite/sonic/frontboost-sonic/boost_sonic_4.png'
];

const BackboostSprites = [
  '../image/sprite/sonic/backboost-sonic/boost_sonic_1.png',
  '../image/sprite/sonic/backboost-sonic/boost_sonic_2.png',
  '../image/sprite/sonic/backboost-sonic/boost_sonic_3.png',
  '../image/sprite/sonic/backboost-sonic/boost_sonic_4.png'
];

const EggmanPawn = [
    '../image/sprite/eggpawn/eggpawn.png',
    '../image/sprite/eggpawn/eggpawn_2.png',
    '../image/sprite/eggpawn/eggpawn_3.png',
];




// 🌱 Décor
const Background = new Image();
Background.src = '../image/background/background.webp';

const floorImg = new Image();
floorImg.src = '../image/background/floor.png';

const Treeimg = new Image();
Treeimg.src = '../image/background/tree.png';

const Bigtreeimg = new Image();
Bigtreeimg.src = '../image/background/bigtree.png';

const Rock = new Image();
Rock.src = '../image/background/rock.png';

const Bush1 = new Image();
Bush1.src = '../image/background/bush1.png';

const Bush2 = new Image();
Bush2.src = '../image/background/bush2.png';

const Bush3 = new Image();
Bush3.src = '../image/background/bush3.png';

const EggmanBall = new Image();
EggmanBall.src = '../image/sprite/eggman/eggman-station.png';

const Singpost = new Image();
Singpost.src = '../image/signpost/sonic-signpost.png';


// =========================
// 📦 CHARGEMENT DES FRAMES
// =========================
const idleFrames = [];
const homingFrames = [];
const frontFrames = [];
const backFrames = [];
const gap = -40;

let loadedCount = 0;
const totalToLoad =
  idleSprites.length +
  homingSprites.length +
  FrontboostSprites.length +
  BackboostSprites.length +
  1; // floorImg

function loadFrames(spritePaths, targetArray) {
  spritePaths.forEach(path => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      loadedCount++;
      // Dès que tout est chargé, on active le bouton PLAY
      if (loadedCount === totalToLoad) {
        loadingFinished = true; 
      }
    };
    targetArray.push(img);
  });
}

floorImg.onload = () => {
  loadedCount++;
  if (loadedCount === totalToLoad) {
    loadingFinished = true;
  }
};

// Lancer le chargement des sprites
loadFrames(idleSprites, idleFrames);
loadFrames(homingSprites, homingFrames);
loadFrames(FrontboostSprites, frontFrames);
loadFrames(BackboostSprites, backFrames);


// =========================
// 🟦 CLASS PLAYER
// =========================
class Player {
  constructor(x, y, idleFrames, homingFrames, frontFrames, backFrames) {
    this.x = x;
    this.y = y;
    this.speed = 20;
    this.groundY = y;
    this.velocityY = 0;
    this.gravity = 0.6;

    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDelay = 8;

    this.animations = {
      idle: idleFrames,
      homing: homingFrames,
      runFront: frontFrames,
      runBack: backFrames,
      axe: [AxeSprite]  // juste une image
    };
    this.isAxe = false;

    this.currentAnimation = "idle";
    this.currentFrames = this.animations.idle;

    this.isHoming = false;
    this.movingLeft = false;
    this.movingRight = false;
  }

  setAnimation(name) {
    if (this.currentAnimation !== name) {
      this.currentAnimation = name;
      this.currentFrames = this.animations[name];
      this.frameIndex = 0;
    }
  }

  

  // Lance le homing jump
  homingAttack() {
    if (!this.isHoming) {
      this.isHoming = true;
      this.setAnimation("homing");
      this.velocityY = -12; // saut vers le haut
    }
  }

  // Lance le axe attack
  axeAttack() {
    // On ne peut le faire que si Sonic est déjà en l’air et qu'il n'est pas déjà en axe
    if (this.isHoming && !this.isAxe) {
      this.isAxe = true;          // Sonic est maintenant en axe attack
      this.setAnimation("axe");   // change l'image
      this.velocityY = 15;        // descente rapide
    }
  }

  // Met à jour le joueur à chaque frame
  update(delta) {
    // Animation frame
    this.frameTimer++;
    if (this.frameTimer >= this.frameDelay) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % this.currentFrames.length;
    }

    // Mouvement horizontal
    if (this.movingRight) this.x += this.speed * delta;
    if (this.movingLeft) this.x -= this.speed * delta;

    // Limites horizontales
    if (this.x < 300) this.x = 300;
    if (this.x > 11000) this.x = 11000;

    // Gestion du saut / homing / axe
    if (this.isHoming) {
      if (!this.isAxe) {
        this.velocityY += this.gravity; // chute normale
      }
      this.y += this.velocityY;

      // Atterrissage
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isHoming = false;
        this.isAxe = false; // reset axe après toucher le sol
      }
    }

    // Gestion des animations selon l'état
    if (this.isAxe) this.setAnimation("axe");
    else if (this.isHoming) this.setAnimation("homing");
    else if (this.movingRight) this.setAnimation("runFront");
    else if (this.movingLeft) this.setAnimation("runBack");
    else this.setAnimation("idle");

    // Camera
    cameraX = this.x - canvas.width / 2 + 25;
  }

  // Dessine le joueur
  draw(ctx) {
    let width = 50;
    let height = 50;
    if (this.currentAnimation === "idle") {
       width *= 1.2;
      height *= 1.2;
    }
       if (this.currentAnimation === "homing") {
       width *= 1.3;
      height *= 1.3;
    }
  
    if (this.currentAnimation === "runFront" || this.currentAnimation === "runBack") {
      width *= 1.5;
      height *= 1.5;
    }
     if (this.currentAnimation === "axe") {
    width *= 1.7 ;   // ajuster selon la taille souhaitée
    height *= 1.7;  // ajuster selon la taille souhaitée
  }
    const offsetY = height - 50;
    ctx.drawImage(this.currentFrames[this.frameIndex], this.x - cameraX, this.y - offsetY, width, height);
  }
}

// =========================
// 🟦 CLASS EGGPAWN
// =========================
class Eggpawn {
  constructor(x, y, frames) {
    this.x = x;
    this.y = y;
    this.frames = frames;
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDelay = 12;
    this.width = 90;
    this.height = 65;
    this.isAlive = true;
    this.facing = "left";

    this.speedX = -0.5; // va vers la gauche au départ
    this.minX = 300;  // limite gauche
    this.maxX = x;    // limite droite = position de spawn
  }

  update() {
    this.frameTimer++;
    if (this.frameTimer >= this.frameDelay) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }

    this.x += this.speedX;
    this.facing = this.speedX > 0 ? "right" : "left";


    // Si on touche la limite gauche → on repart à droite
    if (this.x <= this.minX) {
      this.x = this.minX;
      this.speedX *= -1;
    }

    // Si on touche la limite droite → on repart à gauche
    if (this.x >= this.maxX) {
      this.x = this.maxX;
      this.speedX *= -1;
    }
  }

draw(ctx) {
  if (!this.isAlive) return;

  const drawX = this.x - cameraX;
  const drawY = this.y;

  ctx.save();

  if (this.facing === "right") {
    ctx.translate(drawX + this.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.frames[this.frameIndex], 0, drawY, this.width, this.height);
  } else {
    ctx.drawImage(this.frames[this.frameIndex], drawX, drawY, this.width, this.height);
  }

  ctx.restore();
}

}

// =========================
// 📦 CHARGEMENT DES FRAMES EGGPAWN
// =========================
const eggFrames = [];
EggmanPawn.forEach(src => {
  const img = new Image();
  img.src = src;
  eggFrames.push(img);
});

// =========================
// 🌟 ENNEMIS + COMPTEUR
// =========================
let eggpawns = [];
let totalEggpawns = 0;
let remainingEggpawns = 0;

class Ring {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDelay = 6 // vitesse animation

    this.frameSize = 64;
    this.framesPerRow = 4;
  }

  update() {
    this.frameTimer++;
    if (this.frameTimer >= this.frameDelay) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % 16;
    }
  }

  draw(ctx) {
    const sx = (this.frameIndex % this.framesPerRow) * this.frameSize;
    const sy = Math.floor(this.frameIndex / this.framesPerRow) * this.frameSize;

    ctx.drawImage(
      RingSheet,
      sx, sy, 64, 64,        // source
      this.x - cameraX, this.y, 64/2, 64/2 // destination
    );
  }
}

class UIRing {
  constructor(x, y, size = 32) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDelay = 6; // vitesse animation

    this.frameSize = 64;   // taille de chaque frame dans le sprite sheet
    this.framesPerRow = 4; // ton sprite sheet est 4x4
  }

  update() {
    this.frameTimer++;
    if (this.frameTimer >= this.frameDelay) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % 16;
    }
  }

  draw(ctx) {
    const sx = (this.frameIndex % this.framesPerRow) * this.frameSize;
    const sy = Math.floor(this.frameIndex / this.framesPerRow) * this.frameSize;

    ctx.drawImage(
      RingSheet,
      sx, sy, this.frameSize, this.frameSize, // source
      this.x, this.y, this.size, this.size    // destination
    );
  }
}

let uiRing = new UIRing(20, 20, 32); // position en haut à gauche, taille 32x32
let totalRings = 50; // nombre total de rings à collecter

// Variable globale pour le timer
let gameStartTime = null;

function drawLoadingScreen() {
    if (gameState !== "loading") return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (loadingScreen.readyState >= 2) {
        ctx.drawImage(loadingScreen, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (loadingFinished) {
    const btnWidth = 200;
    const btnHeight = 60;
    const btnX = canvas.width / 2 - btnWidth / 2;
    const btnY = canvas.height - 100;

    // Fond bouton
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

    // Bordure
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

    // Texte
    ctx.fillStyle = "black";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PLAY", canvas.width / 2, btnY + btnHeight / 2);


}
    requestAnimationFrame(drawLoadingScreen);
}

function onPlayClick(e) {
    if (!loadingFinished) return;

    const clickX = e.offsetX;
    const clickY = e.offsetY;

    const btnWidth = 200;
    const btnHeight = 60;
    const btnX = canvas.width / 2 - btnWidth / 2;
    const btnY = canvas.height - 100;

    console.log("CLICK", clickX, clickY);

    if (
        clickX >= btnX &&
        clickX <= btnX + btnWidth &&
        clickY >= btnY &&
        clickY <= btnY + btnHeight
    ) {
        console.log("PLAY CLICKED");
        gameState = "game";
        startAnimation();

        // ❌ Supprime ce listener pour qu'il ne fonctionne plus
        canvas.removeEventListener("click", onPlayClick);
    }
}
canvas.addEventListener("click", onPlayClick);
// Démarrage vidéo seulement quand elle est prête
loadingScreen.addEventListener("canplaythrough", () => {
    loadingScreen.play();
});

// Commence le loop du loading screen
drawLoadingScreen();

function startGameTimer() {
  gameStartTime = performance.now(); // Timestamp du début du jeu
}

function getFormattedTime() {
  if (!gameStartTime) return "00:00:00";

  const elapsed = performance.now() - gameStartTime; // ms
  const totalSeconds = Math.floor(elapsed / 1000);

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function drawUI(ctx) {
  // =========================
  // Dessine la Ring animée
  // =========================
  uiRing.update();
  uiRing.draw(ctx);

  // Compteur de rings récupérés / total
  const collectedRings = totalRings - rings.length;
  const ringText = `${collectedRings}/${totalRings}`;

  ctx.font = "24px Arial";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black"; // contour noir
  ctx.lineWidth = 3;

  // contour du texte
  ctx.strokeText(ringText, 80, 40);
  // texte blanc
  ctx.fillText(ringText, 80, 40);

  // =========================
  // Dessine l'Eggpawn à côté
  // =========================
  const collectedEggs = totalEggpawns - remainingEggpawns;
  const eggText = `${collectedEggs}/${totalEggpawns}`;

  const eggIcon = eggFrames[0]; // première frame du Eggpawn
  const eggX = 150;
  const eggY = 20;
  const size = 32; // taille de l'icône

  ctx.drawImage(eggIcon, eggX, eggY, size, size);

  ctx.strokeText(eggText, eggX + size + 40, eggY + 18);
  ctx.fillText(eggText, eggX + size + 40, eggY + 18);

  // =========================
  // Dessine le minuteur
  // =========================
  const timeText = getFormattedTime();

  const timeX = canvas.width - 50;
  const timeY = 20;

  ctx.strokeText(timeText, timeX, timeY);
  ctx.fillText(timeText, timeX, timeY);
}
let rings = [];

// =========================
// 🎮 INPUT
// =========================
let player;
document.addEventListener("keydown", e => {
  if (e.code === "ArrowRight") player.movingRight = true;
  if (e.code === "ArrowLeft") player.movingLeft = true;

  if (e.code === "Space") { 
    if (player.y === player.groundY) {
      // Sonic est au sol → saut normal
      player.homingAttack(); 
    } else {
      // Sonic est déjà en l'air → axe attack
      player.axeAttack();
    }
    JumpSound.play(); 
  }
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowRight") player.movingRight = false;
  if (e.code === "ArrowLeft") player.movingLeft = false;
});


document.addEventListener("keyup", e => {
  if (e.code === "ArrowRight") player.movingRight = false;
  if (e.code === "ArrowLeft") player.movingLeft = false;
});

// =========================
// 💥 COLLISION
// =========================
function checkCollision(player, enemy) {
  if (!enemy.isAlive) return;

  // Taille de la hitbox selon l'état
  let hitboxSizeX = 40;
  let hitboxSizeY = 40;

  if (player.isAxe) {
    // Hitbox plus grande pour l'axe
    hitboxSizeX = 80;  // largeur doublée
    hitboxSizeY = 80;  // hauteur doublée
  }

  const distanceX = Math.abs(player.x - enemy.x);
  const distanceY = Math.abs(player.y - enemy.y);

  if (distanceX < hitboxSizeX && distanceY < hitboxSizeY) {
    if (player.isHoming || player.isAxe) {
      // Player détruit l'ennemi
      enemy.isAlive = false;
      remainingEggpawns--;
      console.log("💥 Eggpawn détruit !");
    } else {
      // Player touche l'ennemi sans être en homing → game over
      LosingScreen();
    }
  }
}

function checkRingCollision(player, ring) {
  const dx = Math.abs(player.x - ring.x);
  const dy = Math.abs(player.y - ring.y);

  if (dx < 40 && dy < 40) {
    // ramassé
    rings = rings.filter(r => r !== ring);
  }
  else {
    // non ramassé
  }
}

// =========================
// 🎨 DESSIN
// =========================
 function gameInterface() {
  ctx.fillStyle = '#b0b0b0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  



for (let i = 0; i < 30; i++) {
    // Fond très loin → léger flou, opacité réduite
    ctx.save();
    if (heavyFXEnabled) {
  ctx.filter = "blur(1px)";
} else {
  ctx.filter = "none";
}
    ctx.globalAlpha = 2;
    ctx.drawImage(Background, i * 660 - cameraX * 0.1, 0, 1980 / 3, 1080 / 3);
    ctx.restore();
}

for (let i = 0; i < 1; i++) {
    // Fond très loin → léger flou, opacité réduite
    ctx.save();
 if (heavyFXEnabled) {
  ctx.filter = "blur(1px)";
} else {
  ctx.filter = "none";
}
    ctx.globalAlpha = 2;
    ctx.drawImage(EggmanBall, 550, 0, 256/2, 256/2);
    ctx.restore();
}


for (let i = 0; i < 30; i++) {
    // Arbres lointains → un peu plus nets
    ctx.save();
if (heavyFXEnabled) {
  ctx.filter = "blur(0.5px)";
} else {
  ctx.filter = "none";
}
    ctx.globalAlpha = 0.85;
    ctx.drawImage(Bigtreeimg, -30 + i * 270 - cameraX * 0.2, 50, 250, 400);
    ctx.restore();
}

for (let i = 0; i < 30; i++) {
    // Arbres moyens → ombres légères pour effet relief
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.globalAlpha = 1;
    ctx.drawImage(Treeimg, 160 + i * 270 - cameraX * 0.3, 30, 145, 260);
    ctx.restore();
}


for (let i = 0; i < 30; i++) {
    // Buissons → plus proches, ombres plus nettes
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.drawImage(Bush3, 150 + i * 200 - cameraX * 0.5, 170, 250 / 1.5, 190 / 1.5);
    ctx.drawImage(Bush1, i * 200 - cameraX * 0.5, 170, 250 / 1.5, 190 / 1.5);
    ctx.drawImage(Bush2, 150 + i * 200 - cameraX * 0.5, 170, 250 / 1.5, 190 / 1.5);
    ctx.restore();
}

// Rochers / objets très proches → ombres plus prononcées
ctx.save();
ctx.shadowColor = "rgba(0,0,0,0.7)";
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 7;
ctx.shadowOffsetY = 7;
ctx.drawImage(Rock, 10 - cameraX * 0.8, 260, 95 / 2, 60 / 2);
ctx.restore();

ctx.drawImage(Singpost, 260 - cameraX * 0.8, 235, 50, 50);


  for (let i = 0; i < 30; i++) ctx.drawImage(floorImg, -cameraX + i * (floorImg.naturalWidth + gap), 280, floorImg.naturalWidth, 220);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  // ctx.fillText("Sonic X: " + Math.floor(player.x), 20, 30);

  // 🟦 AFFICHAGE DU COMPTEUR D’ENNEMIS
  // ctx.fillText("Eggpawns restants: " + remainingEggpawns, 20, 60);
  rings.forEach(r => r.draw(ctx));
  player.draw(ctx);
  // drawPlayerDebug(ctx); 
  eggpawns.forEach(e => e.draw(ctx));
  drawUI(ctx);
}

// =========================
// 🔁 LOOP
// =========================
function loop(now) {
   if (!gameRunning || gameState !== "game") return;
 const delta = (now - lastTime) / 16.666; // 1 = 60 FPS
  lastTime = now;

  player.update(delta);
  eggpawns.forEach(e => e.update(delta));
  eggpawns.forEach(e => checkCollision(player, e));
  rings.forEach(r => r.update(delta));
  rings.forEach(r => checkRingCollision(player, r));
  gameInterface();
  VictoryScreen();

  animationId = requestAnimationFrame(loop);
}

function resetGame() {
  // Stop la loop
  gameRunning = false;
  if (animationId) cancelAnimationFrame(animationId);

  // Reset audio
  GameBGM.pause();
  GameBGM.currentTime = 0;

  // Reset caméra
  cameraX = 0;

  // Reset tableaux
  eggpawns = [];

  // Reset compteurs
  totalEggpawns = 0;
  remainingEggpawns = 0;

  // Reset canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Supprime overlays s’ils existent
  victoryOverlay.classList.add("hidden");
losingOverlay.classList.add("hidden");
victoryOverlay.style.opacity = "1";
losingOverlay.style.opacity = "1";

  // Recrée le jeu
  startAnimation();
}

// =========================
// ▶️ START
// =========================

function VictoryScreen() {
  if (remainingEggpawns === 0 && victoryOverlay.classList.contains("hidden")) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    victoryOverlay.classList.remove("hidden");
  }
}

function restartVictory() {
  victoryOverlay.style.opacity = "0";

  victoryOverlay.addEventListener("transitionend", () => {
    victoryOverlay.classList.add("hidden");
    victoryOverlay.style.opacity = "1";
    resetGame();
  }, { once: true });
}

function restartLosing() {
  losingOverlay.style.opacity = "0";

  losingOverlay.addEventListener("transitionend", () => {
    losingOverlay.classList.add("hidden");
    losingOverlay.style.opacity = "1";
    resetGame();
  }, { once: true });
}
function ResetAll() {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const losingOverlay = document.getElementById("losingOverlay");

    // 1️⃣ Supprime tous les listeners du canvas
    const newCanvas = canvas.cloneNode(true); // clone pour enlever tous les listeners
    canvas.parentNode.replaceChild(newCanvas, canvas);
    console.log("✅ Tous les listeners du canvas supprimés !");

    // 2️⃣ Cache le losing overlay
    if (losingOverlay) {
        losingOverlay.style.display = "none";
        console.log("✅ Losing overlay caché !");
    }

    // 3️⃣ Stop tous les sons
    document.querySelectorAll("audio").forEach(a => {
        a.pause();
        a.currentTime = 0;
        a.src = ""; // supprime la source pour être sûr
    });
    console.log("✅ Tous les sons stoppés !");

    // 4️⃣ Arrête la boucle du jeu si existante
    if (window.animationId) {
        cancelAnimationFrame(window.animationId);
        window.animationId = null;
        console.log("✅ Boucle du jeu stoppée !");
    }

    // 5️⃣ Import dynamique du module titleScreen et réactive ses listeners
    import("./titleScreen.js")
        .then(module => {
            console.log("✅ Module titleScreen chargé !");
            if (module.TitleScreen) {
                // On passe le canvas cloné (propre, sans listener)
                module.TitleScreen(newCanvas);
            }
        })
        .catch(err => {
            console.error("❌ Impossible de charger titleScreen.js :", err);
        });
}

function drawPlayerDebug(ctx) {
    // Coordonnées de Sonic
    const sonicX = Math.floor(player.x);
    const sonicY = Math.floor(player.y);

    // Dessine un rectangle autour de Sonic
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x - cameraX - 25, player.y - 50, 50, 50); // ajuster selon taille sprite
    ctx.restore();

    // Affiche la position X
    ctx.save();
    ctx.font = "16px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText("Sonic X: " + sonicX, 10, 20);
    ctx.restore();
}




// --------------------
// LosingScreen en dehors
// --------------------
function LosingScreen() {
  if (!losingOverlay.classList.contains("hidden")) return;

  gameRunning = false;
  cancelAnimationFrame(animationId);
  losingOverlay.classList.remove("hidden");
}

   export function startAnimation() {
    startGameTimer();
    gameRunning = true;

    GameBGM.loop = true;
    GameBGM.play();

    // ❌ Si une game loop existe déjà, on l'arrête
    if (window.animationId) {
        cancelAnimationFrame(window.animationId);
        console.log("⚠️ Game loop précédente annulée !");
    }

    // Réinitialisation ennemis et rings
    eggpawns = [];
    for (let i = 0; i < 10; i++) {
        eggpawns.push(new Eggpawn(800 + i * 500, 220, eggFrames));
    }

    rings = [];
    for (let i = 0; i < 50; i++) {
        rings.push(new Ring(400 + i * 200, 200));
    }

    totalEggpawns = eggpawns.length;
    remainingEggpawns = totalEggpawns;

    // Crée le joueur
    player = new Player(300, 240, idleFrames, homingFrames, frontFrames, backFrames);

    // Lance la loop
    window.animationId = requestAnimationFrame(loop);
}

document.getElementById("restartVictoryBtn")?.addEventListener("click", restartVictory);
document.getElementById("restartLosingBtn")?.addEventListener("click", restartLosing);
document.getElementById("resetAllBtn")?.addEventListener("click", ResetAll);
