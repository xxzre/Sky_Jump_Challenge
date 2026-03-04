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
const JUMP_FORCE = -12;
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
let coins = parseInt(localStorage.getItem('skyJumpCoins')) || 0; // Sistema de Moedas
let enemies = []; // Inimigos que causam dano

// Exibir Recorde Inicial
highScoreValue.textContent = highScore;

// Assets
const playerImg = new Image();
playerImg.src = 'assets/Porquinho_da_Sorte.png'; // Nova skin: Porco de Terno
const platformImg = new Image();
platformImg.src = 'assets/platform_sprite_1772562823010.png';

class Player {
    constructor() {
        this.width = 55; // Aumentado para melhor visibilidade da skin
        this.height = 55;
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

        if (playerImg.complete && playerImg.naturalWidth !== 0) {
            // Desenha a skin do porco
            ctx.drawImage(playerImg, this.x, drawY, this.width, this.height);
        } else {
            // Fallback: Alien Procedural
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

            // Olhos Grandes e Pretos
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
    }

    jump() {
        this.vy = JUMP_FORCE;
    }
}

class Platform {
    constructor(y, isFirst = false) {
        this.width = 80;
        this.height = 12;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = y;

        // Define se é uma plataforma de Boost (15% de chance, exceto a primeira)
        this.type = (!isFirst && Math.random() < 0.15) ? 'BOOST' : 'NORMAL';

        // Moedas (30% de chance de ter uma moeda se não for boost)
        this.hasCoin = (!isFirst && this.type === 'NORMAL' && Math.random() < 0.3);
        this.coinCollected = false;
    }

    draw() {
        const drawY = this.y - cameraY;

        // Desenha Plataforma
        ctx.fillStyle = (this.type === 'BOOST') ? '#ffeb3b' : '#ffffff';
        if (this.type === 'BOOST') {
            // Desenha detalhe do trampolim
            ctx.fillRect(this.x, drawY, this.width, this.height);
            ctx.fillStyle = '#f44336';
            ctx.fillRect(this.x + 10, drawY - 4, this.width - 20, 4);
        } else {
            ctx.fillRect(this.x, drawY, this.width, this.height);
        }

        // Desenha Moeda
        if (this.hasCoin && !this.coinCollected) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, drawY - 15, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#b8860b';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Brilho da moeda
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2 - 2, drawY - 17, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Enemy {
    constructor(y) {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.pulse = 0;
    }

    update() {
        this.x += this.vx;
        if (this.x <= 0 || this.x + this.width >= CANVAS_WIDTH) {
            this.vx *= -1;
        }
        this.pulse += 0.1;
    }

    draw() {
        const drawY = this.y - cameraY;
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        ctx.save();
        ctx.translate(this.x + this.width / 2, drawY + this.height / 2);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#9c27b0';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4a148c';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + this.pulse * 0.5;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
            ctx.lineTo(Math.cos(angle) * 25, Math.sin(angle) * 25);
            ctx.stroke();
        }
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(0, -2, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(0, -2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
        let maxGap = (score >= 800) ? 145 : 170;
        const gap = Math.min(80 + (score / 12), maxGap);
        platforms.push(new Platform(highest.y - gap));
    }

    if (platforms.length > 0 && platforms[0].y - cameraY > CANVAS_HEIGHT + 100) {
        platforms.shift();
    }
}

function spawnEnemies() {
    if (score < 300) return;

    if (enemies.length === 0 || enemies[enemies.length - 1].y > cameraY - 400) {
        const spawnChance = Math.min(0.05 + (score / 5000), 0.2);
        if (Math.random() < spawnChance) {
            enemies.push(new Enemy(cameraY - 100));
        }
    }

    if (enemies.length > 0 && enemies[0].y - cameraY > CANVAS_HEIGHT + 100) {
        enemies.shift();
    }
}

function checkCollisions() {
    if (player && player.vy > 0) {
        platforms.forEach(p => {
            if (player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height > p.y &&
                player.y + player.height < p.y + p.height + player.vy) {

                if (p.type === 'BOOST') {
                    player.vy = JUMP_FORCE * 1.8;
                } else {
                    player.jump();
                }

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

            if (p.hasCoin && !p.coinCollected) {
                const coinX = p.x + p.width / 2;
                const coinY = p.y - 15;
                const distX = Math.abs(player.x + player.width / 2 - coinX);
                const distY = Math.abs(player.y + player.height / 2 - coinY);

                if (distX < 30 && distY < 30) {
                    p.coinCollected = true;
                    coins++;
                    updateCoinUI();
                    localStorage.setItem('skyJumpCoins', coins);
                }
            }
        });
    }

    if (player) {
        enemies.forEach(e => {
            const distX = Math.abs((player.x + player.width / 2) - (e.x + e.width / 2));
            const distY = Math.abs((player.y + player.height / 2) - (e.y + e.height / 2));

            if (distX < 25 && distY < 25) {
                endGame();
            }
        });
    }
}

function updateCoinUI() {
    const coinDisplay = document.getElementById('coin-count');
    if (coinDisplay) coinDisplay.textContent = coins;
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
        spawnEnemies();

        platforms.forEach(p => p.draw());
        enemies.forEach(e => {
            e.update();
            e.draw();
        });
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
    enemies = [];
    player = new Player();
    currentColor = { ...COLORS.EARTH };

    // Initial platforms
    for (let i = 0; i < 7; i++) {
        platforms.push(new Platform(CANVAS_HEIGHT - (i * 100) - 50, i === 0));
    }
    platforms[0].x = player.x - 15;

    gameActive = true;
    updateCoinUI();
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

