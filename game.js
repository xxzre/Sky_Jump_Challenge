const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValueDisplay = document.getElementById('score-value');
const highScoreValueDisplay = document.getElementById('high-score-value');
const finalScoreDisplay = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const shopScreen = document.getElementById('shop-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const shopButton = document.getElementById('shop-button');
const closeShopButton = document.getElementById('close-shop');
const restartButton = document.getElementById('restart-button');
const menuButton = document.getElementById('menu-button');
const coinDisplay = document.getElementById('coin-count');
const skinListContainer = document.getElementById('skin-list');
const bgMusic = document.getElementById('bg-music');

// Configurações e Física
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const INITIAL_GRAVITY = 0.35;
const INITIAL_HORIZONTAL_SPEED = 6;
const JUMP_FORCE = -12; // Abaixado para 12
const SCORE_STEP = 200;
const DIFFICULTY_INCREMENT = 0.05;

// Traduções
const TRANSLATIONS = {
    pt: {
        title: "Sky Jump",
        subtitle: "A Jornada do Porquinho da Sorte",
        play: "Jogar Agora",
        shop: "Loja do Porquinho",
        best: "Recorde",
        shop_title: "Loja de Porquinhos",
        back: "Voltar ao Menu",
        game_over: "Fim de Jogo",
        restart: "Novo Voo",
        menu: "Menu Inicial",
        score: "Pontuação",
        purchased: "Comprado",
        active: "Ativo",
        select: "Selecionar",
        coins: "moedas"
    },
    en: {
        title: "Sky Jump",
        subtitle: "Lucky Pig's Cosmic Journey",
        play: "Play Now",
        shop: "Piggy Shop",
        best: "Best",
        shop_title: "Piggy Shop",
        back: "Back to Menu",
        game_over: "Game Over",
        restart: "New Flight",
        menu: "Main Menu",
        score: "Score",
        purchased: "Purchased",
        active: "Active",
        select: "Select",
        coins: "coins"
    }
};

let currentLang = localStorage.getItem('skyJumpLang') || 'pt';

// Skins e Habilidades
const SKINS = [
    { id: 'default', name: 'Porquinho Rosa', color: '#ff80ab', price: 0, ability: { pt: 'Padrão', en: 'Default' }, stats: { gravity: 0, speed: 0, jump: 0, magnet: 35 } },
    { id: 'neon', name: 'Porquinho Neon', color: '#00e5ff', price: 50, ability: { pt: '+25% Velocidade', en: '+25% Speed' }, stats: { gravity: 0, speed: 1.5, jump: 0, magnet: 35 } },
    { id: 'jump', name: 'Porco Saltador', color: '#f50057', price: 100, ability: { pt: '+15% Pulo', en: '+15% Jump' }, stats: { gravity: 0, speed: 0, jump: -2.5, magnet: 35 } },
    { id: 'magnet', name: 'Porco de Ouro', color: '#ffd700', price: 150, ability: { pt: 'Imã de Moedas', en: 'Coin Magnet' }, stats: { gravity: 0, speed: 0, jump: 0, magnet: 100 } },
    { id: 'gravity', name: 'Porco Espacial', color: '#e0e0e0', price: 200, ability: { pt: '-15% Gravidade', en: '-15% Gravity' }, stats: { gravity: -0.05, speed: 0, jump: 0, magnet: 40 } }
];

// Estado do Jogo
let score = 0;
let highScore = localStorage.getItem('skyJumpHighScore') || 0;
let gameActive = false;
let platforms = [];
let cameraY = 0;
let gravity = INITIAL_GRAVITY;
let horizontalSpeed = INITIAL_HORIZONTAL_SPEED;
let currentColor = { r: 135, g: 206, b: 235 };
let animationId = null;
const keys = {};

// Economia e Skins
let coins = parseInt(localStorage.getItem('skyJumpCoins')) || 0;
let purchasedSkins = JSON.parse(localStorage.getItem('skyJumpPurchased')) || ['default'];
let activeSkinId = localStorage.getItem('skyJumpActiveSkin') || 'default';

// Transições de Cores
const COLORS = {
    SKY: { r: 135, g: 206, b: 235 },
    DEEP: { r: 26, g: 35, b: 126 },
    SPACE: { r: 0, g: 0, b: 51 }
};

function updateLangUI() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (TRANSLATIONS[currentLang][key]) {
            el.textContent = TRANSLATIONS[currentLang][key];
        }
    });

    document.getElementById('lang-pt').classList.toggle('active', currentLang === 'pt');
    document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');

    if (gameOverScreen.classList.contains('hidden') === false) {
        finalScoreDisplay.textContent = `${TRANSLATIONS[currentLang].score}: ${score}`;
    }
}

// UI Inicial
highScoreValueDisplay.textContent = highScore;
updateCoinUI();
updateLangUI();

class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT - 100;
        this.vx = 0;
        this.vy = 0;

        const skin = SKINS.find(s => s.id === activeSkinId);
        this.color = skin.color;
        this.stats = skin.stats;
    }

    draw() {
        const drawY = this.y - cameraY;
        const centerX = this.x + this.width / 2;
        const centerY = drawY + this.height / 2;

        ctx.save();

        // Cor do porquinho
        ctx.fillStyle = this.color;

        // Orelhas
        ctx.beginPath();
        ctx.moveTo(centerX - 12, centerY - 15);
        ctx.lineTo(centerX - 24, centerY - 32);
        ctx.lineTo(centerX - 4, centerY - 22);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(centerX + 12, centerY - 15);
        ctx.lineTo(centerX + 24, centerY - 32);
        ctx.lineTo(centerX + 4, centerY - 22);
        ctx.fill();

        // Corpo Redondo
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Focinho (Rosa mais escuro ou cor contrastante)
        ctx.fillStyle = activeSkinId === 'magnet' ? '#b8860b' : '#f06292';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 8, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Narinas
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY + 8, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY + 8, 2, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(centerX - 10, centerY - 5, 4, 0, Math.PI * 2);
        ctx.arc(centerX + 10, centerY - 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Brilho nos olhos
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX - 11, centerY - 6, 1.5, 0, Math.PI * 2);
        ctx.arc(centerX + 9, centerY - 6, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    update() {
        const currentSpeed = horizontalSpeed + this.stats.speed;

        // Horizontal Movement logic including Mobile/Mouse hold
        if (keys['ArrowLeft'] || keys['a'] || keys['left_hold']) {
            this.vx = -currentSpeed;
        }
        else if (keys['ArrowRight'] || keys['d'] || keys['right_hold']) {
            this.vx = currentSpeed;
        }
        else {
            this.vx *= 0.8;
        }

        this.x += this.vx;
        if (this.x + this.width < 0) this.x = CANVAS_WIDTH;
        if (this.x > CANVAS_WIDTH) this.x = -this.width;

        this.vy += (gravity + this.stats.gravity);
        this.y += this.vy;

        if (this.y < cameraY + 250) {
            cameraY = this.y - 250;
        }
    }

    jump(multiplier = 1) {
        this.vy = (JUMP_FORCE + this.stats.jump) * multiplier;
    }
}

class Platform {
    constructor(y, isFirst = false) {
        this.width = 70;
        this.height = 12;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = y;
        this.type = (!isFirst && Math.random() < 0.15) ? 'BOOST' : 'NORMAL';
        this.hasCoin = (!isFirst && this.type === 'NORMAL' && Math.random() < 0.25);
        this.coinCollected = false;
    }

    draw() {
        const drawY = this.y - cameraY;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(this.x + 4, drawY + 4, this.width, this.height);

        if (this.type === 'BOOST') {
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(this.x, drawY, this.width, this.height);
            ctx.fillStyle = '#f44336';
            ctx.fillRect(this.x + 5, drawY - 4, this.width - 10, 4);
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffeb3b';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(this.x, drawY, this.width, this.height);
        }
        ctx.shadowBlur = 0;

        if (this.hasCoin && !this.coinCollected) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, drawY - 15, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function spawnPlatforms() {
    let highestPlatformY = platforms.length > 0 ? platforms[platforms.length - 1].y : CANVAS_HEIGHT;
    while (highestPlatformY > cameraY - 100) {
        highestPlatformY -= 90 + Math.random() * 40;
        platforms.push(new Platform(highestPlatformY));
    }
    if (platforms[0].y - cameraY > CANVAS_HEIGHT + 100) {
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

                player.jump(p.type === 'BOOST' ? 1.8 : 1);

                const currentScore = Math.floor(Math.abs(player.y - (CANVAS_HEIGHT - 100)) / 10);
                if (currentScore > score) {
                    score = currentScore;
                    scoreValueDisplay.textContent = score;
                    if (score % SCORE_STEP === 0 && score > 0) {
                        gravity += DIFFICULTY_INCREMENT;
                    }
                }
            }

            if (p.hasCoin && !p.coinCollected) {
                const coinX = p.x + p.width / 2;
                const coinY = p.y - 15;
                const dist = Math.sqrt(
                    Math.pow((player.x + player.width / 2) - coinX, 2) +
                    Math.pow((player.y + player.height / 2) - coinY, 2)
                );

                if (dist < player.stats.magnet) {
                    p.coinCollected = true;
                    coins++;
                    updateCoinUI();
                    localStorage.setItem('skyJumpCoins', coins);
                }
            }
        });
    }
    if (player.y - cameraY > CANVAS_HEIGHT) endGame();
}

function updateCoinUI() {
    if (coinDisplay) coinDisplay.textContent = coins;
}

function updateBackground() {
    let factor = Math.min(score / 5000, 1);
    if (factor < 0.5) {
        const localFactor = factor * 2;
        currentColor.r = COLORS.SKY.r + (COLORS.DEEP.r - COLORS.SKY.r) * localFactor;
        currentColor.g = COLORS.SKY.g + (COLORS.DEEP.g - COLORS.SKY.g) * localFactor;
        currentColor.b = COLORS.SKY.b + (COLORS.DEEP.b - COLORS.SKY.b) * localFactor;
    } else {
        const localFactor = (factor - 0.5) * 2;
        currentColor.r = COLORS.DEEP.r + (COLORS.SPACE.r - COLORS.DEEP.r) * localFactor;
        currentColor.g = COLORS.DEEP.g + (COLORS.SPACE.g - COLORS.DEEP.g) * localFactor;
        currentColor.b = COLORS.DEEP.b + (COLORS.SPACE.b - COLORS.DEEP.b) * localFactor;
    }
    canvas.style.background = `rgb(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)})`;
}

let player = null;

function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    player.update();
    spawnPlatforms();
    checkCollisions();
    updateBackground();
    platforms.forEach(p => p.draw());
    player.draw();
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    player = new Player();
    score = 0;
    cameraY = 0;
    gravity = INITIAL_GRAVITY;
    platforms = [];
    scoreValueDisplay.textContent = '0';

    for (let i = 0; i < 7; i++) {
        platforms.push(new Platform(CANVAS_HEIGHT - (i * 100) - 50, i === 0));
    }
    platforms[0].x = player.x - 15;
    platforms[0].width = 80;

    gameActive = true;
    updateCoinUI();
    startScreen.classList.add('hidden');
    shopScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameLoop();
}

function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = `${TRANSLATIONS[currentLang].score}: ${score}`;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('skyJumpHighScore', highScore);
        highScoreValueDisplay.textContent = highScore;
    }
}

function goToMenu() {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    score = 0;
    scoreValueDisplay.textContent = '0';
}

// Lógica da Loja
function renderShop() {
    skinListContainer.innerHTML = '';
    SKINS.forEach(skin => {
        const isPurchased = purchasedSkins.includes(skin.id);
        const isActive = activeSkinId === skin.id;

        const card = document.createElement('div');
        card.className = `skin-card ${isActive ? 'selected' : ''}`;

        let statusText = isPurchased ? (isActive ? TRANSLATIONS[currentLang].active : TRANSLATIONS[currentLang].select) : `${skin.price} ${TRANSLATIONS[currentLang].coins}`;

        card.innerHTML = `
            <div class="skin-preview" style="background: ${skin.color}"></div>
            <div class="skin-info">
                <span class="skin-name">${skin.name}</span>
                <span class="skin-ability">${skin.ability[currentLang]}</span>
            </div>
            <div class="skin-price">${statusText}</div>
        `;

        card.onclick = () => {
            if (isPurchased) {
                activeSkinId = skin.id;
                localStorage.setItem('skyJumpActiveSkin', activeSkinId);
                renderShop();
            } else if (coins >= skin.price) {
                coins -= skin.price;
                purchasedSkins.push(skin.id);
                activeSkinId = skin.id;
                localStorage.setItem('skyJumpCoins', coins);
                localStorage.setItem('skyJumpPurchased', JSON.stringify(purchasedSkins));
                localStorage.setItem('skyJumpActiveSkin', activeSkinId);
                updateCoinUI();
                renderShop();
            }
        };
        skinListContainer.appendChild(card);
    });
}

// Eventos
shopButton.onclick = () => {
    startScreen.classList.add('hidden');
    shopScreen.classList.remove('hidden');
    renderShop();
};

closeShopButton.onclick = () => {
    shopScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
};

document.getElementById('lang-pt').onclick = () => {
    currentLang = 'pt';
    localStorage.setItem('skyJumpLang', 'pt');
    updateLangUI();
    renderShop();
};

document.getElementById('lang-en').onclick = () => {
    currentLang = 'en';
    localStorage.setItem('skyJumpLang', 'en');
    updateLangUI();
    renderShop();
};

function handlePointerDown(e) {
    if (!gameActive) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);

    if (x < CANVAS_WIDTH / 2) {
        keys['left_hold'] = true;
        keys['right_hold'] = false;
    } else {
        keys['right_hold'] = true;
        keys['left_hold'] = false;
    }
}

function handlePointerUp() {
    keys['left_hold'] = false;
    keys['right_hold'] = false;
}

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

canvas.addEventListener('mousedown', handlePointerDown);
canvas.addEventListener('mouseup', handlePointerUp);
window.addEventListener('mouseup', handlePointerUp);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
canvas.addEventListener('touchend', (e) => { e.preventDefault(); handlePointerUp(); }, { passive: false });

startButton.onclick = startGame;
restartButton.onclick = startGame;
menuButton.onclick = goToMenu;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
renderShop();
