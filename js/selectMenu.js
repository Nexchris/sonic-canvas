const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 360;

const SonicTitle = new Image();
SonicTitle.src = "../image/misc/sonicTitle.png";
const TailsTitle = new Image();
TailsTitle.src = "../image/misc/TailsTitle.webp";
const KnucklesTitle = new Image();
KnucklesTitle.src = "../image/misc/KnucklesTitle.webp";
const AmyTitle = new Image();
AmyTitle.src = "../image/misc/AmyTitle.png";

const SonicButton = new Image();
SonicButton.src = "../image/button/sonic-button.png";
const TailsButton = new Image();
TailsButton.src = "../image/button/tails-button.png";
const KnucklesButton = new Image();
KnucklesButton.src = "../image/button/knuckles-button.png";
const AmyButton = new Image();
AmyButton.src = "../image/button/amy-button.png";

function loadFrames(paths) {
    const frames = [];
    paths.forEach(src => {
        const img = new Image();
        img.src = src;
        frames.push(img);
    });
    return frames;
}

const sonicFrames = loadFrames([
    '../image/sprite/sonic/idle/idle_sonic_1.png',
    '../image/sprite/sonic/idle/idle_sonic_2.png',
    '../image/sprite/sonic/idle/idle_sonic_3.png',
    '../image/sprite/sonic/idle/idle_sonic_4.png',
    '../image/sprite/sonic/idle/idle_sonic_5.png'
]);

const knuckleFrames = loadFrames([
    '../image/sprite/knuckle/idle/idle_knuckle_1.png',
    '../image/sprite/knuckle/idle/idle_knuckle_2.png',
    '../image/sprite/knuckle/idle/idle_knuckle_3.png',
    '../image/sprite/knuckle/idle/idle_knuckle_4.png'
]);

const tailsFrames = loadFrames([
    '../image/sprite/tails/idle/idle_tails_1.png',
    '../image/sprite/tails/idle/idle_tails_2.png',
    '../image/sprite/tails/idle/idle_tails_3.png',
    '../image/sprite/tails/idle/idle_tails_4.png'
]);

const amyFrames = loadFrames([
    '../image/sprite/amy/idle/idle_amy_1.png',
    '../image/sprite/amy/idle/idle_amy_2.png',
    '../image/sprite/amy/idle/idle_amy_3.png',
    '../image/sprite/amy/idle/idle_amy_4.png'
]);

class Character {
    constructor(frames, x, y) {
        this.frames = frames;
        this.x = x;
        this.y = y;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameDelay = 10;
        this.width = 70;
        this.height = 70;
    }

    update() {
        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.frameTimer = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
        }
    }

    draw(ctx) {
        ctx.drawImage(
            this.frames[this.frameIndex],
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

const sonic = new Character(sonicFrames, 40, 150);
const tails = new Character(tailsFrames, 200, 150);
const knuckles = new Character(knuckleFrames, 360, 150);
const amy = new Character(amyFrames, 520, 150);

export function selectMenu() {
    const grad1 = ctx.createLinearGradient(0, 0, 280, 0);
    grad1.addColorStop(0, "#5de0e6");
    grad1.addColorStop(1, "#004aad");

    const grad2 = ctx.createLinearGradient(0, 0, 280, 0);
    grad2.addColorStop(0, "#ffde59");
    grad2.addColorStop(1, "#ff6200");

    const grad3 = ctx.createLinearGradient(0, 0, 280, 0);
    grad3.addColorStop(0, "#ff3131");
    grad3.addColorStop(1, "#a20000");

    const grad4 = ctx.createLinearGradient(0, 0, 280, 0);
    grad4.addColorStop(0, "#dd2c70");
    grad4.addColorStop(1, "#ffa9f9");

    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, 160, 360);

    ctx.fillStyle = grad2;
    ctx.fillRect(160, 0, 160, 360);

    ctx.fillStyle = grad3;
    ctx.fillRect(320, 0, 160, 360);

    ctx.fillStyle = grad4;
    ctx.fillRect(480, 0, 160, 360);

    ctx.drawImage(SonicTitle, 5, 10, 320/2.2, 80/2.2);
    ctx.drawImage(TailsTitle, 160, 0, 1280/8, 534/8);
    ctx.drawImage(KnucklesTitle, 320, 15, 1000/6.2, 205/6.2);
    ctx.drawImage(AmyTitle, 485, 10, 1120/8, 320/8);

    ctx.drawImage(SonicButton, 25, 250, 110, 40);
    ctx.drawImage(TailsButton, 185, 250, 110, 40);
    ctx.drawImage(KnucklesButton, 345, 250, 110, 40);
    ctx.drawImage(AmyButton, 505, 250, 110, 40);
}

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const buttons = [
        { x: 25,  y: 250, w: 110, h: 40 },
        { x: 185, y: 250, w: 110, h: 40 },
        { x: 345, y: 250, w: 110, h: 40 },
        { x: 505, y: 250, w: 110, h: 40 }
    ];

    let hovering = false;

    for (let b of buttons) {
        if (
            mouseX >= b.x &&
            mouseX <= b.x + b.w &&
            mouseY >= b.y &&
            mouseY <= b.y + b.h
        ) {
            hovering = true;
            break;
        }
    }

    canvas.style.cursor = hovering ? "pointer" : "default";
});

function loop() {
    selectMenu();

    sonic.update();
    knuckles.update();
    tails.update();
    amy.update();

    sonic.draw(ctx);
    knuckles.draw(ctx);
    tails.draw(ctx);
    amy.draw(ctx);

    requestAnimationFrame(loop);
}

loop();
