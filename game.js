/**
 * 🛸 Sky Jump: Alien Edition
 * Lógica baseada na Documentação Técnica
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('score-value');
const finalScore = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const bgMusic = document.getElementById('bg-music');

// Configurações Iniciais
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const INITIAL_GRAVITY = 0.35;
const INITIAL_HORIZONTAL_SPEED = 6;
const JUMP_FORCE = -11;
const SCORE_STEP = 200;
const INCREMENT = 0.05;

// Estado do Jogo
let score = 0;
let gameActive = false;
let platforms = [];
let cameraY = 0;
let gravity = INITIAL_GRAVITY;
let horizontalSpeed = INITIAL_HORIZONTAL_SPEED;
let bgColor = '#8B4513'; // Cor inicial: Marrom

// Assets
const playerImg = new Image();
playerImg.src = 'assets/player.png';
const platformImg = new Image();
platformImg.src = 'assets/platform.png';

class Player {
    constructor() {
        this.width = 45;
        this.height = 45;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT - 100;
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        this.x += this.vx;

        // Screen wrap
        if (this.x + this.width < 0) this.x = CANVAS_WIDTH;
        if (this.x > CANVAS_WIDTH) this.x = -this.width;

        this.vy += gravity;
        this.y += this.vy;

        // Game over check
        if (this.y - cameraY > CANVAS_HEIGHT) {
            endGame();
        }
    }

    draw() {
        const drawY = this.y - cameraY;
        if (playerImg.complete && playerImg.naturalWidth !== 0) {
            ctx.drawImage(playerImg, this.x, drawY, this.width, this.height);
        } else {
            // Fallback: Alien Verde (Canvas)
            ctx.fillStyle = '#4CAF50';
            // Cabeça
            ctx.beginPath();
            ctx.ellipse(this.x + 22, drawY + 22, 20, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            // Olhos Grandes
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.ellipse(this.x + 12, drawY + 15, 6, 8, Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(this.x + 32, drawY + 15, 6, 8, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            // Brilho nos olhos
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x + 14, drawY + 12, 2, 0, Math.PI * 2);
            ctx.arc(this.x + 30, drawY + 12, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    jump() {
        this.vy = JUMP_FORCE;
    }
}

class Platform {
    constructor(y) {
        this.width = 75;
        this.height = 18;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = y;
    }

    draw() {
        const drawY = this.y - cameraY;
        if (platformImg.complete && platformImg.naturalWidth !== 0) {
            ctx.drawImage(platformImg, this.x, drawY, this.width, this.height);
        } else {
            // Fallback: Plataforma Estilizada
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(this.x, drawY, this.width, this.height, 5);
            ctx.fill();
            ctx.stroke();
        }
    }
}

function updateColors() {
    if (score <= 500) {
        bgColor = '#8B4513'; // Marrom Solo
    } else if (score <= 1000) {
        bgColor = '#87CEEB'; // Azul Claro Céu
    } else {
        bgColor = '#000033'; // Azul Escuro Espacial
    }
}

function updateDifficulty() {
    const level = Math.floor(score / SCORE_STEP);
    gravity = INITIAL_GRAVITY + (level * INCREMENT);
    horizontalSpeed = INITIAL_HORIZONTAL_SPEED + (level * (INCREMENT * 10));
}

function spawnPlatforms() {
    if (platforms.length === 0) return;
    
    const highest = platforms[platforms.length - 1];
    if (highest.y > cameraY - 100) {
        const gap = Math.min(80 + (score / 10), 160);
        platforms.push(new Platform(highest.y - gap));
    }

    if (platforms[0].y - cameraY > CANVAS_HEIGHT) {
        platforms.shift();
    }
}

function checkCollisions() {
    if (player.vy > 0) {
        platforms.forEach(p => {
            if (player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height > p.y &&
                player.y + player.height < p.y + p.height + player.vy) {
                
                player.jump();
                
                // Score based on height
                const currentScore = Math.floor(Math.abs(player.y - (CANVAS_HEIGHT - 100)) / 10);
                if (currentScore > score) {
                    score = currentScore;
                    scoreValue.textContent = score;
                    updateDifficulty();
                }
            }
        });
    }
}

let player = new Player();

function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    updateColors();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    player.update();
    
    // Smooth camera
    if (player.y < cameraY + CANVAS_HEIGHT * 0.4) {
        cameraY = player.y - CANVAS_HEIGHT * 0.4;
    }

    checkCollisions();
    spawnPlatforms();

    platforms.forEach(p => p.draw());
    player.draw();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    score = 0;
    cameraY = 0;
    gravity = INITIAL_GRAVITY;
    horizontalSpeed = INITIAL_HORIZONTAL_SPEED;
    scoreValue.textContent = '0';
    platforms = [];
    player = new Player();

    // Initial platforms
    for (let i = 0; i < 7; i++) {
        platforms.push(new Platform(CANVAS_HEIGHT - (i * 100) - 50));
    }
    platforms[0].x = player.x - 15;

    gameActive = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Music logic
    bgMusic.play().catch(e => console.log("Aguardando interação para áudio"));
    
    gameLoop();
}

function endGame() {
    gameActive = false;
    gameOverScreen.classList.remove('hidden');
    finalScore.textContent = `Pontuação: ${score}`;
}

// Controles
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') player.vx = -horizontalSpeed;
    if (e.key === 'ArrowRight') player.vx = horizontalSpeed;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.vx = 0;
});

// Mobile/Click
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    player.vx = (x < CANVAS_WIDTH / 2) ? -horizontalSpeed : horizontalSpeed;
});
canvas.addEventListener('mouseup', () => player.vx = 0);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    player.vx = (x < CANVAS_WIDTH / 2) ? -horizontalSpeed : horizontalSpeed;
}, {passive: false});
canvas.addEventListener('touchend', () => player.vx = 0);

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Init Canvas size
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

