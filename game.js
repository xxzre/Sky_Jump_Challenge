/**
 * 💰 Escalada no Dinheiro
 * Jogo de subida infinita focado em moedas e progressão.
 */

window.addEventListener('load', () => {
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
    const JUMP_FORCE = -12;
    const SCORE_STEP = 200;
    const DIFFICULTY_INCREMENT = 0.05;

    // Skins e Habilidades
    const SKINS = [
        { id: 'default', name: 'Porquinho Rosa', color: '#ffb6c1', imgSrc: 'assets/Porquinho_da_Sorte.png', price: 0, ability: 'Padrão', stats: { gravity: 0, speed: 0, jump: 0, magnet: 40 } },
        { id: 'neon', name: 'Neon Runner', color: '#00e5ff', price: 50, ability: '+25% Velocidade', stats: { gravity: 0, speed: 1.5, jump: 0, magnet: 40 } },
        { id: 'jump', name: 'Super Hopper', color: '#ff4081', price: 100, ability: '+15% Pulo', stats: { gravity: 0, speed: 0, jump: -3, magnet: 40 } },
        { id: 'magnet', name: 'Imã de Moedas', color: '#ffea00', price: 150, ability: 'Imã Potente', stats: { gravity: 0, speed: 0, jump: 0, magnet: 120 } },
        { id: 'gravity', name: 'Astronauta', color: '#ffffff', price: 200, ability: '-15% Gravidade', stats: { gravity: -0.05, speed: 0, jump: 0, magnet: 45 } }
    ];

    // Estado do Jogo
    let score = 0;
    let highScore = parseInt(localStorage.getItem('skyJumpHighScore')) || 0;
    let gameActive = false;
    let platforms = [];
    let enemies = [];
    let cameraY = 0;
    let gravity = INITIAL_GRAVITY;
    let horizontalSpeed = INITIAL_HORIZONTAL_SPEED;
    let currentColor = { r: 135, g: 206, b: 235 };
    let animationId = null;
    const keys = {};

    // Economia e Skins
    let coins = parseInt(localStorage.getItem('skyJumpCoins')) || 0;
    let purchasedSkins = [];
    try {
        purchasedSkins = JSON.parse(localStorage.getItem('skyJumpPurchased')) || ['default'];
        if (!Array.isArray(purchasedSkins)) purchasedSkins = ['default'];
    } catch (e) {
        purchasedSkins = ['default'];
    }
    let activeSkinId = localStorage.getItem('skyJumpActiveSkin') || 'default';

    // Transições de Cores
    const COLORS = {
        SKY: { r: 135, g: 206, b: 235 },
        DEEP: { r: 26, g: 35, b: 126 },
        SPACE: { r: 0, g: 0, b: 51 }
    };

    // UI Inicial
    if (highScoreValueDisplay) highScoreValueDisplay.textContent = highScore;
    updateCoinUI();

    function updateCoinUI() {
        if (coinDisplay) coinDisplay.textContent = coins;
    }

    class Player {
        constructor() {
            this.width = 45;
            this.height = 45;
            this.x = CANVAS_WIDTH / 2 - this.width / 2;
            this.y = CANVAS_HEIGHT - 100;
            this.vx = 0;
            this.vy = 0;

            const skin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];
            this.color = skin.color;
            this.stats = skin.stats;
            if (skin.imgSrc) {
                this.image = new Image();
                this.image.src = skin.imgSrc;
            } else {
                this.image = null;
            }
        }

        draw() {
            const drawY = this.y - cameraY;

            if (this.image && this.image.complete && this.image.naturalWidth > 0) {
                ctx.drawImage(this.image, this.x, drawY, this.width, this.height);
                return;
            }

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, drawY + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Olhos como fallback
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2 - 8, drawY + 15, 5, 0, Math.PI * 2);
            ctx.arc(this.x + this.width / 2 + 8, drawY + 15, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            const currentSpeed = horizontalSpeed + this.stats.speed;
            if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.vx = -currentSpeed;
            else if (keys['ArrowRight'] || keys['d'] || keys['D']) this.vx = currentSpeed;
            else this.vx *= 0.8;

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
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(this.x, drawY, this.width, this.height);
            }

            if (this.hasCoin && !this.coinCollected) {
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, drawY - 15, 8, 0, Math.PI * 2);
                ctx.fill();
                // Bordas da moeda
                ctx.strokeStyle = '#b8860b';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    class Enemy {
        constructor(y) {
            this.width = 40;
            this.height = 40;
            this.x = Math.random() * (CANVAS_WIDTH - this.width);
            this.y = y;
            this.vx = (Math.random() - 0.5) * 4;
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

            // Espinhos (novidade do prompt)
            ctx.strokeStyle = '#4a148c';
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + this.pulse * 0.5;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
                ctx.lineTo(Math.cos(angle) * 25, Math.sin(angle) * 25);
                ctx.stroke();
            }

            // Olho vermelho malvado
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

    function spawnPlatforms() {
        let highestPlatformY = platforms.length > 0 ? platforms[platforms.length - 1].y : CANVAS_HEIGHT;
        while (highestPlatformY > cameraY - 100) {
            highestPlatformY -= 90 + Math.random() * 40;
            platforms.push(new Platform(highestPlatformY));
        }
        if (platforms.length > 0 && platforms[0].y - cameraY > CANVAS_HEIGHT + 100) {
            platforms.shift();
        }
    }

    function spawnEnemies() {
        // Surgem após 400 pontos para dar tempo de acostumar
        if (score < 400) return;

        if (enemies.length === 0 || enemies[enemies.length - 1].y > cameraY - 400) {
            const spawnChance = Math.min(0.05 + (score / 8000), 0.15);
            if (Math.random() < spawnChance) {
                enemies.push(new Enemy(cameraY - 150));
            }
        }

        if (enemies.length > 0 && enemies[0].y - cameraY > CANVAS_HEIGHT + 100) {
            enemies.shift();
        }
    }

    function checkCollisions() {
        if (!player) return;

        // Colisões com plataformas (apenas caindo)
        if (player.vy > 0) {
            platforms.forEach(p => {
                if (player.x + player.width > p.x &&
                    player.x < p.x + p.width &&
                    player.y + player.height > p.y &&
                    player.y + player.height < p.y + p.height + player.vy) {

                    player.jump(p.type === 'BOOST' ? 1.8 : 1);

                    const currentScore = Math.floor(Math.abs(player.y - (CANVAS_HEIGHT - 100)) / 10);
                    if (currentScore > score) {
                        score = currentScore;
                        if (scoreValueDisplay) scoreValueDisplay.textContent = score;
                        if (score % SCORE_STEP === 0 && score > 0) {
                            gravity += DIFFICULTY_INCREMENT;
                        }
                    }
                }
            });
        }

        // Colisões com moedas e inimigos
        platforms.forEach(p => {
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

        enemies.forEach(e => {
            const distX = Math.abs((player.x + player.width / 2) - (e.x + e.width / 2));
            const distY = Math.abs((player.y + player.height / 2) - (e.y + e.height / 2));

            if (distX < 25 && distY < 25) {
                endGame();
            }
        });

        if (player.y - cameraY > CANVAS_HEIGHT) {
            endGame();
        }
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
        spawnEnemies();
        checkCollisions();
        updateBackground();

        platforms.forEach(p => p.draw());
        enemies.forEach(e => {
            e.update();
            e.draw();
        });
        player.draw();

        animationId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameActive = true;
        player = new Player();
        score = 0;
        cameraY = 0;
        gravity = INITIAL_GRAVITY;
        horizontalSpeed = INITIAL_HORIZONTAL_SPEED;
        platforms = [];
        enemies = [];

        if (scoreValueDisplay) scoreValueDisplay.textContent = '0';

        // Primeira plataforma garantida sob o jogador
        const firstP = new Platform(CANVAS_HEIGHT - 50, true);
        firstP.x = CANVAS_WIDTH / 2 - firstP.width / 2;
        platforms.push(firstP);

        // Preencher tela inicial
        for (let i = 1; i < 7; i++) {
            platforms.push(new Platform(CANVAS_HEIGHT - (i * 100) - 50));
        }

        updateCoinUI();
        if (startScreen) startScreen.classList.add('hidden');
        if (shopScreen) shopScreen.classList.add('hidden');
        if (gameOverScreen) gameOverScreen.classList.add('hidden');

        if (bgMusic) {
            bgMusic.play().catch(() => { });
        }

        gameLoop();
    }

    function endGame() {
        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);
        if (gameOverScreen) gameOverScreen.classList.remove('hidden');
        if (finalScoreDisplay) finalScoreDisplay.textContent = `Score: ${score}`;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('skyJumpHighScore', highScore);
            if (highScoreValueDisplay) highScoreValueDisplay.textContent = highScore;
        }
    }

    function renderShop() {
        if (!skinListContainer) return;
        skinListContainer.innerHTML = '';
        SKINS.forEach(skin => {
            const isPurchased = purchasedSkins.includes(skin.id);
            const isActive = activeSkinId === skin.id;

            const card = document.createElement('div');
            card.className = `skin-card ${isActive ? 'selected' : ''}`;

            let previewHTML = '';
            if (skin.imgSrc) {
                previewHTML = `<div class="skin-preview" style="background-image: url('${skin.imgSrc}'); background-size: cover; background-position: center; border-radius: 50%;"></div>`;
            } else {
                previewHTML = `<div class="skin-preview" style="background: ${skin.color}"></div>`;
            }

            card.innerHTML = `
                ${previewHTML}
                <div class="skin-info">
                    <span class="skin-name">${skin.name}</span>
                    <span class="skin-ability">${skin.ability}</span>
                </div>
                <div class="skin-price">${isPurchased ? (isActive ? 'Ativo' : 'Selecionar') : skin.price + ' moedas'}</div>
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

    // Configurar Eventos
    if (startButton) startButton.onclick = startGame;
    if (restartButton) restartButton.onclick = startGame;
    if (shopButton) {
        shopButton.onclick = () => {
            if (startScreen) startScreen.classList.add('hidden');
            if (shopScreen) shopScreen.classList.remove('hidden');
            renderShop();
        };
    }
    if (closeShopButton) {
        closeShopButton.onclick = () => {
            if (shopScreen) shopScreen.classList.add('hidden');
            if (startScreen) startScreen.classList.remove('hidden');
        };
    }
    if (menuButton) {
        menuButton.onclick = () => {
            if (gameOverScreen) gameOverScreen.classList.add('hidden');
            if (startScreen) startScreen.classList.remove('hidden');
        };
    }

    const handlePointerDown = (e) => {
        if (!gameActive || !player) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
        player.vx = (x < CANVAS_WIDTH / 2) ? -horizontalSpeed : horizontalSpeed;
    };

    const handlePointerUp = () => {
        if (player) player.vx = 0;
    };

    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handlePointerDown(e);
    }, { passive: false });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        handlePointerUp();
    }, { passive: false });

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Iniciar loja em background
    renderShop();
});
