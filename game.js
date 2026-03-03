/**
 * 🛸 Sky Jump Alien: Journey to the Stars
 * Baseado no novo GDD - Implementação Antigravity
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('score-value');
const highScoreValue = document.getElementById('high-score-value');
const finalScore = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const bgMusic = document.getElementById('bg-music');

// Configurações e Física
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const INITIAL_GRAVITY = 0.35;
const INITIAL_HORIZONTAL_SPEED = 6;
const JUMP_FORCE = -11;
const SCORE_STEP = 200;
const DIFFICULTY_INCREMENT = 0.1;

// Cores para Transição (RGB)
const COLORS = {
    EARTH: { r: 139, g: 69, b: 19 },     // #8B4513 (Marrom)
    SKY: { r: 135, g: 206, b: 235 },      // #87CEEB (Azul Claro)
    SPACE: { r: 0, g: 0, b: 51 }          // #000033 (Azul Escuro)
};

// Estado do Jogo
let score = 0;
let highScore = localStorage.getItem('skyJumpHighScore') || 0;
let gameActive = false;
let platforms = [];
let cameraY = 0;
let gravity = INITIAL_GRAVITY;
let horizontalSpeed = INITIAL_HORIZONTAL_SPEED;
let currentColor = { ...COLORS.EARTH };
let animationId = null; // ID para controlar o loop
const keys = {}; // Rastreador de teclas pressionadas

// Exibir Recorde Inicial
highScoreValue.textContent = highScore;

// Assets
const playerImg = new Image();
playerImg.src = 'assets/alien_no_bg_v2_1772566443003.png';
const platformImg = new Image();
platformImg.src = 'assets/platform_sprite_1772562823010.png';

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

        // Lógica de movimento baseada nas teclas pressionadas
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.vx = -horizontalSpeed;
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.vx = horizontalSpeed;
        } else {
            this.vx = 0;
        }

        // Game over check
        if (this.y - cameraY > CANVAS_HEIGHT) {
            endGame();
        }
    }

    draw() {
        const drawY = this.y - cameraY;

        ctx.save();
        ctx.translate(this.x + this.width / 2, drawY + this.height / 2);

        // Efeito de sombra leve abaixo do alien
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 25, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Corpo/Cabeça do Alien (Verde Vibrante)
        const gradient = ctx.createRadialGradient(-5, -5, 5, 0, 0, 25);
        gradient.addColorStop(0, '#a2ff00'); // Brilho interno
        gradient.addColorStop(1, '#4CAF50'); // Cor base

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Detalhe da borda para dar profundidade
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Olhos Grandes e Pretos (Estilo Alien Clássico)
        ctx.fillStyle = '#1a1a1a';

        // Olho Esquerdo
        ctx.save();
        ctx.translate(-10, -2);
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        // Brilho no Olho
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(2, -4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Olho Direito
        ctx.save();
        ctx.fillStyle = '#1a1a1a';
        ctx.translate(10, -2);
        ctx.rotate(-Math.PI / 6);
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        // Brilho no Olho
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-2, -4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    jump() {
        this.vy = JUMP_FORCE;
    }
}

class Platform {
    constructor(y) {
        this.width = 80;
        this.height = 12; // Deixando as plataformas mais finas conforme pedido
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = y;
    }

    draw() {
        const drawY = this.y - cameraY;
        if (platformImg.complete && platformImg.naturalWidth !== 0) {
            ctx.drawImage(platformImg, this.x, drawY, this.width, this.height);
        } else {
            // Retângulo simples para máxima compatibilidade
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x, drawY, this.width, this.height);
        }
    }
}

// Funções Auxiliares
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function updateColors() {
    let factor = 0;

    if (score <= 500) {
        factor = score / 500;
        currentColor.r = Math.floor(lerp(COLORS.EARTH.r, COLORS.SKY.r, factor));
        currentColor.g = Math.floor(lerp(COLORS.EARTH.g, COLORS.SKY.g, factor));
        currentColor.b = Math.floor(lerp(COLORS.EARTH.b, COLORS.SKY.b, factor));
    } else if (score <= 1000) {
        factor = (score - 500) / 500;
        currentColor.r = Math.floor(lerp(COLORS.SKY.r, COLORS.SPACE.r, factor));
        currentColor.g = Math.floor(lerp(COLORS.SKY.g, COLORS.SPACE.g, factor));
        currentColor.b = Math.floor(lerp(COLORS.SKY.b, COLORS.SPACE.b, factor));
    } else {
        currentColor = { ...COLORS.SPACE };
    }
}

function updateDifficulty() {
    const level = Math.floor(score / SCORE_STEP);
    gravity = INITIAL_GRAVITY + (level * 0.02);
    horizontalSpeed = INITIAL_HORIZONTAL_SPEED + (level * 0.5);
}

function spawnPlatforms() {
    if (platforms.length === 0) return;

    const highest = platforms[platforms.length - 1];
    if (highest.y > cameraY - 100) {
        const gap = Math.min(80 + (score / 12), 170);
        platforms.push(new Platform(highest.y - gap));
    }

    if (platforms.length > 0 && platforms[0].y - cameraY > CANVAS_HEIGHT + 100) {
        platforms.shift();
    }
}

function checkCollisions() {
    if (player && player.vy > 0) {
        platforms.forEach(p => {
            if (player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height > p.y &&
                player.y + player.height < p.y + p.height + player.vy) {

                player.jump();

                const currentScore = Math.floor(Math.abs(player.y - (CANVAS_HEIGHT - 100)) / 10);
                if (currentScore > score) {
                    score = currentScore;
                    scoreValue.textContent = score;
                    updateDifficulty();

                    if (score > highScore) {
                        highScore = score;
                        highScoreValue.textContent = highScore;
                        localStorage.setItem('skyJumpHighScore', highScore);
                    }
                }
            }
        });
    }
}

let player = null;

function gameLoop() {
    if (!gameActive) return;

    updateColors();
    ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (player) {
        player.update();

        if (player.y < cameraY + CANVAS_HEIGHT * 0.4) {
            cameraY = player.y - CANVAS_HEIGHT * 0.4;
        }

        checkCollisions();
        spawnPlatforms();

        platforms.forEach(p => p.draw());
        player.draw();
    }

    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    // Parar qualquer loop anterior
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    score = 0;
    cameraY = 0;
    gravity = INITIAL_GRAVITY;
    horizontalSpeed = INITIAL_HORIZONTAL_SPEED;
    scoreValue.textContent = '0';
    platforms = [];
    player = new Player();
    currentColor = { ...COLORS.EARTH };

    // Initial platforms
    for (let i = 0; i < 7; i++) {
        platforms.push(new Platform(CANVAS_HEIGHT - (i * 100) - 50));
    }
    platforms[0].x = player.x - 15;

    gameActive = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    if (bgMusic) {
        bgMusic.play().catch(() => console.log("Som aguardando interação"));
    }

    gameLoop();
}

function endGame() {
    gameActive = false;
    gameOverScreen.classList.remove('hidden');
    finalScore.textContent = `Pontuação: ${score}`;
}

// Controles
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

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
}, { passive: false });
canvas.addEventListener('touchend', () => player.vx = 0);

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

