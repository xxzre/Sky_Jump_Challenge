/**
 * Sky Jump Challenge - Core Logic
 * Canvas-based Infinite Jumper
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-value');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Game constants
const GRAVITY = 0.4;
const JUMP_FORCE = -12;
const BASE_PLATFORM_SPEED = 0; // Platforms only move down as camera moves
const HORIZONTAL_SPEED = 7;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

// Game state
let score = 0;
let highScore = 0;
let gameActive = false;
let platforms = [];
let player;
let cameraY = 0;
let speedMultiplier = 1;

// Assets
const assets = {
    player: new Image(),
    platform: new Image(),
    background: new Image(),
    jumpSound: null,
    gameOverSound: null
};

// Setup paths (using local assets folder)
assets.player.src = 'assets/player.png';
assets.platform.src = 'assets/platform.png';
assets.background.src = 'assets/background.png';

// Fallback colors if images fail
const colors = {
    player: '#00bcd4',
    platform: '#ffffff',
    bgStart: '#1e3c72',
    bgEnd: '#2a5298'
};

class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT - 100;
        this.vx = 0;
        this.vy = 0;
        this.jumpForce = JUMP_FORCE;
    }

    update() {
        // Horizontal movement
        this.x += this.vx;

        // Screen wrap
        if (this.x + this.width < 0) this.x = CANVAS_WIDTH;
        if (this.x > CANVAS_WIDTH) this.x = -this.width;

        // Gravity
        this.vy += GRAVITY;
        this.y += this.vy;

        // Death condition
        if (this.y - cameraY > CANVAS_HEIGHT) {
            endGame();
        }
    }

    draw() {
        ctx.save();
        const drawY = this.y - cameraY;
        
        if (assets.player.complete && assets.player.naturalWidth !== 0) {
            ctx.drawImage(assets.player, this.x, drawY, this.width, this.height);
        } else {
            // Draw fallback rounded player
            ctx.fillStyle = colors.player;
            ctx.beginPath();
            ctx.roundRect(this.x, drawY, this.width, this.height, 10);
            ctx.fill();
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x + 10, drawY + 15, 4, 0, Math.PI * 2);
            ctx.arc(this.x + 30, drawY + 15, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    jump() {
        this.vy = this.jumpForce;
    }
}

class Platform {
    constructor(y, type = 'normal') {
        this.width = 70;
        this.height = 15;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = y;
        this.type = type;
    }

    draw() {
        const drawY = this.y - cameraY;
        if (assets.platform.complete && assets.platform.naturalWidth !== 0) {
            ctx.drawImage(assets.platform, this.x, drawY, this.width, this.height);
        } else {
            // Draw fallback platform
            ctx.fillStyle = colors.platform;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.roundRect(this.x, drawY, this.width, this.height, 5);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

function initGame() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    player = new Player();
    platforms = [];
    score = 0;
    cameraY = 0;
    speedMultiplier = 1;
    scoreElement.textContent = '0';

    // Starting platforms
    for (let i = 0; i < 7; i++) {
        platforms.push(new Platform(CANVAS_HEIGHT - (i * 100) - 50));
    }
    
    // Ensure first platform is under player
    platforms[0].x = player.x - 15;
}

function spawnPlatforms() {
    const highestPlatformY = platforms[platforms.length - 1].y;
    
    // Maintain a buffer of platforms above the camera
    if (highestPlatformY > cameraY - 100) {
        // Difficulty scaling: platforms get further apart
        const gap = Math.min(120 + (score / 200) * 10, 180);
        platforms.push(new Platform(highestPlatformY - gap));
    }

    // Remove off-screen platforms
    if (platforms[0].y - cameraY > CANVAS_HEIGHT) {
        platforms.shift();
    }
}

function checkCollisions() {
    if (player.vy > 0) { // Only collide when falling
        platforms.forEach(p => {
            if (player.x + player.width > p.x && 
                player.x < p.x + p.width &&
                player.y + player.height > p.y &&
                player.y + player.height < p.y + p.height + player.vy) {
                
                player.y = p.y - player.height;
                player.jump();
                
                // Update score based on height reached
                const currentHeight = Math.floor(Math.abs(player.y - (CANVAS_HEIGHT - 100)) / 10);
                if (currentHeight > score) {
                    score = currentHeight;
                    scoreElement.textContent = score;
                    updateDifficulty();
                }
            }
        });
    }
}

function updateDifficulty() {
    // Escalonamento: V_atual = V_base + (Score/200 * Incremento)
    // In our case, higher score makes jumping slightly harder by increasing speed and gaps
    speedMultiplier = 1 + (score / 200) * 0.1;
}

function update() {
    if (!gameActive) return;

    player.update();
    
    // Camera follow
    if (player.y < cameraY + CANVAS_HEIGHT * 0.4) {
        cameraY = player.y - CANVAS_HEIGHT * 0.4;
    }

    checkCollisions();
    spawnPlatforms();
    
    draw();
    requestAnimationFrame(update);
}

function draw() {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, colors.bgStart);
    gradient.addColorStop(1, colors.bgEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dynamic sky bg if loaded
    if (assets.background.complete && assets.background.naturalWidth !== 0) {
        // Parallax background
        const bgY = (cameraY * 0.5) % CANVAS_HEIGHT;
        ctx.drawImage(assets.background, 0, -bgY, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(assets.background, 0, -bgY + CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    platforms.forEach(p => p.draw());
    player.draw();
}

function startGame() {
    initGame();
    gameActive = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    update();
}

function endGame() {
    gameActive = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = `Pontuação: ${score}`;
    if (score > highScore) highScore = score;
}

// Controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') player.vx = -HORIZONTAL_SPEED;
    if (e.key === 'ArrowRight') player.vx = HORIZONTAL_SPEED;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.vx = 0;
});

// Touch/Mouse controls for horizontal movement
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < CANVAS_WIDTH / 2) player.vx = -HORIZONTAL_SPEED;
    else player.vx = HORIZONTAL_SPEED;
});

canvas.addEventListener('mouseup', () => player.vx = 0);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    if (touchX < CANVAS_WIDTH / 2) player.vx = -HORIZONTAL_SPEED;
    else player.vx = HORIZONTAL_SPEED;
}, {passive: false});

canvas.addEventListener('touchend', () => player.vx = 0);

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initialization
initGame();
draw(); // Initial draw for the start screen background
