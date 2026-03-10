/**
 * 💰 Escalada no Dinheiro
 * Jogo de subida infinita focado em moedas e progressão.
 */

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreValueDisplay = document.getElementById('score-value');
    const highScoreValueDisplay = document.getElementById('high-score-value');
    const highScoreGameDisplay = document.getElementById('high-score-game');
    const finalScoreDisplay = document.getElementById('final-score');
    const startScreen = document.getElementById('start-screen');
    const shopScreen = document.getElementById('shop-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const shopButton = document.getElementById('shop-button');
    const closeShopButton = document.getElementById('close-shop');
    const restartButton = document.getElementById('restart-button');
    const menuButton = document.getElementById('menu-button');
    const worldsButton = document.getElementById('worlds-btn-menu');
    const worldsScreen = document.getElementById('worlds-screen');
    const closeWorldsButton = document.getElementById('close-worlds');
    const worldListContainer = document.getElementById('world-list');
    const settingsButton = document.getElementById('settings-btn-menu');
    const settingsScreen = document.getElementById('settings-screen');
    const closeSettingsButton = document.getElementById('close-settings');
    const volumeControl = document.getElementById('volume-control');
    const mapLeftBtn = document.getElementById('map-left');
    const mapRightBtn = document.getElementById('map-right');
    const coinDisplay = document.getElementById('coin-count');
    const notification = document.getElementById('notification');
    const skinListContainer = document.getElementById('skin-list');
    const bgMusic = document.getElementById('bg-music');

    // Elementos de Tradução
    const uiElements = {
        title: document.querySelector('.floating'),
        startBtn: document.getElementById('start-btn'),
        shopBtn: document.getElementById('shop-btn-menu'),
        worldsBtn: document.getElementById('worlds-btn-menu'),
        bestLabel: document.getElementById('best-label'),
        settingsTitle: document.getElementById('settings-title'),
        volumeLabel: document.getElementById('volume-label'),
        controlsLabel: document.getElementById('controls-label'),
        leftLabel: document.getElementById('left-label'),
        rightLabel: document.getElementById('right-label'),
        closeSettingsBtn: document.getElementById('close-settings'),
        worldsTitle: document.getElementById('worlds-title'),
        closeWorldsBtn: document.getElementById('close-worlds'),
        shopTitle: document.getElementById('shop-title'),
        closeShopBtn: document.getElementById('close-shop'),
        gameOverTitle: document.querySelector('#game-over-screen h1'),
        restartBtn: document.getElementById('restart-button'),
        menuBtn: document.getElementById('menu-button')
    };

    const TRANSLATIONS = {
        pt: {
            title: 'Escalada no Dinheiro',
            startBtn: 'Jogar Agora',
            shopBtn: 'Loja',
            worldsBtn: 'Mundos',
            bestLabel: 'Melhor',
            settingsTitle: 'Configurações',
            volumeLabel: 'Volume',
            controlsLabel: 'Controles',
            leftLabel: 'Esquerda',
            rightLabel: 'Direita',
            closeSettingsBtn: 'Voltar',
            worldsTitle: 'Selecionar Mundo',
            closeWorldsBtn: 'Voltar',
            shopTitle: 'Mercado de Skins',
            closeShopBtn: 'Voltar',
            gameOverTitle: 'Fim de Jogo',
            restartBtn: 'Novo Vôo',
            menuBtn: 'Menu Principal',
            active: 'Ativo',
            select: 'Selecionar',
            errorCoins: '💰 Erro, Moedas insuficiente',
            pressKey: 'Pressione...',
            specialAbility: 'Tema Visual Especial'
        },
        en: {
            title: 'Money Climb',
            startBtn: 'Play Now',
            shopBtn: 'Shop',
            worldsBtn: 'Worlds',
            bestLabel: 'Best',
            settingsTitle: 'Settings',
            volumeLabel: 'Volume',
            controlsLabel: 'Controls',
            leftLabel: 'Left',
            rightLabel: 'Right',
            closeSettingsBtn: 'Back',
            worldsTitle: 'Select World',
            closeWorldsBtn: 'Back',
            shopTitle: 'Skin Market',
            closeShopBtn: 'Back',
            gameOverTitle: 'Game Over',
            restartBtn: 'New Flight',
            menuBtn: 'Main Menu',
            active: 'Active',
            select: 'Select',
            errorCoins: '💰 Error, Not enough coins',
            pressKey: 'Press key...',
            specialAbility: 'Special Visual Theme'
        }
    };

    let currentLang = localStorage.getItem('skyJumpLang') || 'pt';

    // Controles Customizados
    let leftKey = localStorage.getItem('skyJumpKeyLeft') || 'a';
    let rightKey = localStorage.getItem('skyJumpKeyRight') || 'd';
    let isMapping = null; // 'left' ou 'right'

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
        { id: 'default', name: 'Porquinho Gay', color: '#ffb6c1', imgSrc: 'assets/Porquinho_Da_Sorte_Gay.png', price: 0, ability: 'Padrão', stats: { gravity: 0, speed: 0, jump: 0, magnet: 40 } },
        { id: 'neon', name: 'Porquinho Preto', color: '#000000ff', imgSrc: 'assets/Porquinho_Da_Sorte_Preto.png', price: 50, ability: '+25% Velocidade', stats: { gravity: 0, speed: 1.5, jump: 0, magnet: 40 } },
        { id: 'jump', name: 'Porquinho do Bolsonaro', color: '#ffe600ff', imgSrc: 'assets/Porquinho_Da_Sorte_Bolsonarista.png', price: 100, ability: 'Imã Infinito + Buff (15% Tudo) + 2x Moedas', stats: { gravity: -0.0525, speed: 0.9, jump: -1.8, magnet: 2000 } },
        { id: 'magnet', name: 'Porquinho Petista', color: '#ff0000ff', imgSrc: 'assets/Porquinho_da_Sorte_PT.png?v=1', price: 150, ability: 'Imã Infinito', stats: { gravity: 0, speed: 0, jump: 0, magnet: 2000 } },
        { id: 'gravity', name: 'Porquinho Do Bem', color: '#ffffff', imgSrc: 'assets/Porquinho_Da_Sorte_Branco.png', price: 200, ability: '-15% Gravidade', stats: { gravity: -0.05, speed: 0, jump: 0, magnet: 45 } }
    ];

    const WORLDS = [
        { id: 'classic', name: 'Mundo Clássico', price: 0, colors: { SKY: { r: 135, g: 206, b: 235 }, DEEP: { r: 26, g: 35, b: 126 }, SPACE: { r: 0, g: 0, b: 51 } } },
        { id: 'neon', name: 'Cidade Neon', price: 500, colors: { SKY: { r: 40, g: 0, b: 80 }, DEEP: { r: 0, g: 0, b: 30 }, SPACE: { r: 0, g: 0, b: 0 } } },
        { id: 'gold', name: 'Cofre de Ouro', price: 1000, colors: { SKY: { r: 218, g: 165, b: 32 }, DEEP: { r: 0, g: 100, b: 0 }, SPACE: { r: 0, g: 0, b: 0 } } }
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
    let keysCount = 0;
    let boostMultiplier = 1.0;
    let rewardOptions = [];

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

    // Mundos
    let purchasedWorlds = JSON.parse(localStorage.getItem('skyJumpWorlds')) || ['classic'];
    let activeWorldId = localStorage.getItem('skyJumpActiveWorld') || 'classic';

    // Transições de Cores
    function getActiveWorldColors() {
        const world = WORLDS.find(w => w.id === activeWorldId) || WORLDS[0];
        return world.colors;
    }

    // UI Inicial
    updateLanguageUI();
    if (highScoreValueDisplay) highScoreValueDisplay.textContent = highScore;
    if (highScoreGameDisplay) highScoreGameDisplay.textContent = highScore;
    updateCoinUI();

    function updateLanguageUI() {
        const lang = TRANSLATIONS[currentLang];
        if (uiElements.title) uiElements.title.textContent = lang.title;
        if (uiElements.startBtn) uiElements.startBtn.textContent = lang.startBtn;
        if (uiElements.shopBtn) uiElements.shopBtn.textContent = lang.shopBtn;
        if (uiElements.worldsBtn) uiElements.worldsBtn.textContent = lang.worldsBtn;
        if (uiElements.bestLabel) uiElements.bestLabel.textContent = lang.bestLabel;
        if (uiElements.settingsTitle) uiElements.settingsTitle.textContent = lang.settingsTitle;
        if (uiElements.volumeLabel) uiElements.volumeLabel.textContent = lang.volumeLabel;
        if (uiElements.controlsLabel) uiElements.controlsLabel.textContent = lang.controlsLabel;
        if (uiElements.leftLabel) uiElements.leftLabel.textContent = lang.leftLabel;
        if (uiElements.rightLabel) uiElements.rightLabel.textContent = lang.rightLabel;
        if (uiElements.closeSettingsBtn) uiElements.closeSettingsBtn.textContent = lang.closeSettingsBtn;
        if (uiElements.worldsTitle) uiElements.worldsTitle.textContent = lang.worldsTitle;
        if (uiElements.closeWorldsBtn) uiElements.closeWorldsBtn.textContent = lang.closeWorldsBtn;
        if (uiElements.shopTitle) uiElements.shopTitle.textContent = lang.shopTitle;
        if (uiElements.closeShopBtn) uiElements.closeShopBtn.textContent = lang.closeShopBtn;
        if (uiElements.gameOverTitle) uiElements.gameOverTitle.textContent = lang.gameOverTitle;
        if (uiElements.restartBtn) uiElements.restartBtn.textContent = lang.restartBtn;
        if (uiElements.menuBtn) uiElements.menuBtn.textContent = lang.menuBtn;

        if (mapLeftBtn) mapLeftBtn.textContent = leftKey.toUpperCase();
        if (mapRightBtn) mapRightBtn.textContent = rightKey.toUpperCase();

        document.getElementById('btn-pt')?.classList.toggle('active', currentLang === 'pt');
        document.getElementById('btn-en')?.classList.toggle('active', currentLang === 'en');

        localStorage.setItem('skyJumpLang', currentLang);
    }

    function updateCoinUI() {
        if (coinDisplay) coinDisplay.textContent = coins;
    }

    function updateKeyUI() {
        const keyCountLabel = document.getElementById('key-count');
        if (keyCountLabel) keyCountLabel.textContent = keysCount;
    }

    function triggerRewardChest() {
        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);

        const rewardScreen = document.getElementById('reward-chest-screen');
        rewardScreen.classList.remove('hidden');

        const slots = document.querySelectorAll('.reward-slot');
        const possibleRewards = [
            { type: 'BOOST', icon: '🚀', value: 1.30, label: 'Super Boost (Jumps +30%)' }, // O item de boost especial
            { type: 'COINS', icon: '💰', value: 100, label: '+100 Moedas' },
            { type: 'COINS', icon: '�', value: 250, label: '+250 Moedas' },
            { type: 'COINS', icon: '💰', value: 500, label: '+500 Moedas' },
            { type: 'COINS', icon: '💎', value: 750, label: '+750 Moedas' },
            { type: 'COINS', icon: '�', value: 1500, label: '+1500 Moedas' }
        ];

        // Shuffle rewards
        rewardOptions = possibleRewards.sort(() => Math.random() - 0.5);

        slots.forEach((slot, index) => {
            slot.textContent = '?';
            slot.classList.remove('revealed');
            slot.onclick = () => {
                const reward = rewardOptions[index];
                slot.textContent = reward.icon;
                slot.classList.add('revealed');

                applyReward(reward);

                setTimeout(() => {
                    rewardScreen.classList.add('hidden');
                    keysCount = 0;
                    updateKeyUI();
                    gameActive = true;
                    gameLoop();
                }, 1500);
            };
        });
    }

    function applyReward(reward) {
        if (reward.type === 'BOOST') {
            boostMultiplier *= reward.value;
        } else if (reward.type === 'COINS') {
            coins += reward.value;
            updateCoinUI();
        } else if (reward.type === 'SCORE') {
            score += reward.value;
            if (scoreValueDisplay) scoreValueDisplay.textContent = score;
        } else if (reward.type === 'GRAVITY') {
            INITIAL_GRAVITY += reward.value; // permanent decrease
        } else if (reward.type === 'MAGNET') {
            SKINS.forEach(s => s.stats.magnet += reward.value);
        }
        showNotification(`Premio: ${reward.label}!`);
        localStorage.setItem('skyJumpCoins', coins);
    }

    function showNotification(message) {
        if (!notification) return;
        notification.textContent = message;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
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
            const goLeft = (keys[leftKey] === true) || (keys[leftKey.toUpperCase()] === true) || (keys['ArrowLeft'] === true);
            const goRight = (keys[rightKey] === true) || (keys[rightKey.toUpperCase()] === true) || (keys['ArrowRight'] === true);

            if (goLeft) this.vx = -currentSpeed;
            else if (goRight) this.vx = currentSpeed;
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
            this.vy = (JUMP_FORCE + this.stats.jump) * multiplier * boostMultiplier;
        }
    }

    class Platform {
        constructor(y, isFirst = false) {
            this.width = 70;
            this.height = 12;
            this.x = Math.random() * (CANVAS_WIDTH - this.width);
            this.y = y;

            // Novos tipos: BOOST (15%) e VANISH (15%)
            const rand = Math.random();
            if (!isFirst && rand < 0.15) {
                this.type = 'BOOST';
            } else if (!isFirst && rand < 0.30) {
                this.type = 'VANISH';
            } else {
                this.type = 'NORMAL';
            }

            this.hasCoin = (!isFirst && Math.random() < 0.50);
            this.hasKey = (!isFirst && !this.hasCoin && Math.random() < 0.15); // 15% de chance de chave se não tiver moeda
            this.coinCollected = false;
            this.keyCollected = false;

            // Posição individual da moeda/chave para efeito de imã
            this.itemX = this.x + this.width / 2;
            this.itemY = y - 15;

            // Timer para plataformas que somem (180 frames = ~3 segundos a 60fps)
            this.timer = 0;
            this.visible = true;
        }

        update() {
            if (this.type === 'VANISH') {
                this.timer++;
                if (this.timer >= 180) {
                    this.visible = !this.visible;
                    this.timer = 0;
                }
            }

            // Efeito de Imã: Se tiver item e não foi coletado, puxar para o player
            const hasActiveItem = (this.hasCoin && !this.coinCollected) || (this.hasKey && !this.keyCollected);
            if (hasActiveItem && player && gameActive) {
                const dist = Math.sqrt(
                    Math.pow((player.x + player.width / 2) - this.itemX, 2) +
                    Math.pow((player.y + player.height / 2) - this.itemY, 2)
                );

                if (dist < player.stats.magnet) {
                    const angle = Math.atan2((player.y + player.height / 2) - this.itemY, (player.x + player.width / 2) - this.itemX);
                    const speed = 12;
                    this.itemX += Math.cos(angle) * speed;
                    this.itemY += Math.sin(angle) * speed;

                    if (dist < 30) {
                        if (this.hasCoin && !this.coinCollected) {
                            this.coinCollected = true;
                            let coinValue = 1;
                            if (activeWorldId === 'neon') coinValue = 5;
                            if (activeWorldId === 'gold') coinValue = 20;
                            if (activeSkinId === 'jump') coinValue *= 2;
                            coins += coinValue;
                            updateCoinUI();
                        } else if (this.hasKey && !this.keyCollected) {
                            this.keyCollected = true;
                            keysCount++;
                            updateKeyUI();
                            if (keysCount >= 3) {
                                triggerRewardChest();
                            }
                        }
                        localStorage.setItem('skyJumpCoins', coins);
                    }
                }
            }
        }

        draw() {
            if (!this.visible) return;

            const drawY = this.y - cameraY;
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(this.x + 4, drawY + 4, this.width, this.height);

            if (this.type === 'BOOST') {
                ctx.fillStyle = '#ffeb3b';
                ctx.fillRect(this.x, drawY, this.width, this.height);
                ctx.fillStyle = '#f44336';
                ctx.fillRect(this.x + 5, drawY - 4, this.width - 10, 4);
            } else if (this.type === 'VANISH') {
                ctx.fillStyle = '#00e5ff'; // Cor ciano para identificar
                ctx.fillRect(this.x, drawY, this.width, this.height);
                // Efeito de pulso para avisar que vai sumir
                if (this.timer > 120) {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(this.x, drawY, this.width, this.height);
                }
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(this.x, drawY, this.width, this.height);
            }

            if (this.hasCoin && !this.coinCollected) {
                const coinDrawY = this.itemY - cameraY;
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(this.itemX, coinDrawY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#b8860b';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (this.hasKey && !this.keyCollected) {
                const keyDrawY = this.itemY - cameraY;
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🔑', this.itemX, keyDrawY + 7);
            }
        }
    }

    class Enemy {
        constructor(y, currentScore) {
            this.width = 40;
            this.height = 40;
            this.x = Math.random() * (CANVAS_WIDTH - this.width);
            this.y = y;

            // Velocidade escala com a pontuação a partir de 500
            let speedBoost = currentScore > 500 ? (currentScore - 500) / 1000 : 0;
            let baseSpeed = 4 + speedBoost;
            this.vx = (Math.random() - 0.5) * baseSpeed;
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
            const scale = 1 + Math.sin(this.pulse) * 0.05;
            ctx.save();
            ctx.translate(this.x + this.width / 2, drawY + this.height / 2);
            ctx.scale(scale, scale);

            // Corpo do Porco Inimigo (Rosa mais forte)
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#c2185b';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Orelhas
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.moveTo(-15, -10);
            ctx.lineTo(-22, -22);
            ctx.lineTo(-5, -15);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(15, -10);
            ctx.lineTo(22, -22);
            ctx.lineTo(5, -15);
            ctx.fill();
            ctx.stroke();

            // Olhos bravos
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-6, -4, 4, 0, Math.PI * 2);
            ctx.arc(6, -4, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(-6, -4, 2, 0, Math.PI * 2);
            ctx.arc(6, -4, 2, 0, Math.PI * 2);
            ctx.fill();

            // Sobrancelhas bravas
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -10); ctx.lineTo(-2, -6);
            ctx.moveTo(10, -10); ctx.lineTo(2, -6);
            ctx.stroke();

            // Focinho
            ctx.fillStyle = '#ff4081';
            ctx.beginPath();
            ctx.ellipse(0, 5, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Pintas do focinho
            ctx.fillStyle = '#c2185b';
            ctx.beginPath();
            ctx.arc(-3, 5, 1.5, 0, Math.PI * 2);
            ctx.arc(3, 5, 1.5, 0, Math.PI * 2);
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

        const spawnY = cameraY - 150;
        const minDistance = 400; // Garante que bixos não nasçam grudados

        if (enemies.length === 0 || (enemies[enemies.length - 1].y > spawnY + minDistance)) {
            // Chance de spawn mais equilibrada
            let densityBoost = score > 500 ? (score - 500) / 10000 : 0;
            const spawnChance = Math.min(0.02 + (score / 20000) + densityBoost, 0.15);

            if (Math.random() < spawnChance) {
                enemies.push(new Enemy(spawnY, score));
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
                if (p.visible &&
                    player.x + player.width > p.x &&
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

        // Colisões com inimigos e queda
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
        const COLORS = getActiveWorldColors();
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

        platforms.forEach(p => {
            p.update();
            p.draw();
        });
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
            if (highScoreGameDisplay) highScoreGameDisplay.textContent = highScore;
        }
    }

    function renderShop() {
        if (!skinListContainer) return;
        const lang = TRANSLATIONS[currentLang];
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

            const priceText = isPurchased ? (isActive ? lang.active : lang.select) : skin.price + ' moedas';

            card.innerHTML = `
                ${previewHTML}
                <div class="skin-info">
                    <span class="skin-name">${skin.name}</span>
                    <span class="skin-ability">${skin.ability}</span>
                </div>
                <div class="skin-price">${priceText}</div>
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
                } else {
                    showNotification(lang.errorCoins);
                }
            };
            skinListContainer.appendChild(card);
        });
    }

    function renderWorlds() {
        if (!worldListContainer) return;
        const lang = TRANSLATIONS[currentLang];
        worldListContainer.innerHTML = '';
        WORLDS.forEach(world => {
            const isPurchased = purchasedWorlds.includes(world.id);
            const isActive = activeWorldId === world.id;

            const card = document.createElement('div');
            card.className = `world-card ${isActive ? 'selected' : ''}`;

            const previewColor = `rgb(${world.colors.SKY.r}, ${world.colors.SKY.g}, ${world.colors.SKY.b})`;

            card.innerHTML = `
                <div class="world-preview" style="background: ${previewColor}"></div>
                <div class="skin-info">
                    <span class="skin-name">${world.name}</span>
                    <span class="skin-ability">${lang.specialAbility}</span>
                </div>
                <div class="skin-price">${isPurchased ? (isActive ? lang.active : lang.select) : world.price + ' moedas'}</div>
            `;

            card.onclick = () => {
                if (isPurchased) {
                    activeWorldId = world.id;
                    localStorage.setItem('skyJumpActiveWorld', activeWorldId);
                    renderWorlds();
                } else if (coins >= world.price) {
                    coins -= world.price;
                    purchasedWorlds.push(world.id);
                    activeWorldId = world.id;
                    localStorage.setItem('skyJumpCoins', coins);
                    localStorage.setItem('skyJumpWorlds', JSON.stringify(purchasedWorlds));
                    localStorage.setItem('skyJumpActiveWorld', activeWorldId);
                    updateCoinUI();
                    renderWorlds();
                } else {
                    showNotification(lang.errorCoins);
                }
            };
            worldListContainer.appendChild(card);
        });
    }

    // Configurar Eventos
    if (startButton) startButton.onclick = startGame;
    if (document.getElementById('start-btn')) document.getElementById('start-btn').onclick = startGame;
    if (restartButton) restartButton.onclick = startGame;

    if (document.getElementById('shop-btn-menu')) {
        document.getElementById('shop-btn-menu').onclick = () => {
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

    if (document.getElementById('worlds-btn-menu')) {
        document.getElementById('worlds-btn-menu').onclick = () => {
            if (startScreen) startScreen.classList.add('hidden');
            if (worldsScreen) worldsScreen.classList.remove('hidden');
            renderWorlds();
        };
    }

    if (closeWorldsButton) {
        closeWorldsButton.onclick = () => {
            if (worldsScreen) worldsScreen.classList.add('hidden');
            if (startScreen) startScreen.classList.remove('hidden');
        };
    }

    if (settingsButton) {
        settingsButton.onclick = () => {
            if (startScreen) startScreen.classList.add('hidden');
            if (settingsScreen) settingsScreen.classList.remove('hidden');
        };
    }

    if (closeSettingsButton) {
        closeSettingsButton.onclick = () => {
            if (settingsScreen) settingsScreen.classList.add('hidden');
            if (startScreen) startScreen.classList.remove('hidden');
        };
    }

    if (volumeControl) {
        volumeControl.oninput = (e) => {
            if (bgMusic) bgMusic.volume = e.target.value;
        };
    }

    if (mapLeftBtn) {
        mapLeftBtn.onclick = () => {
            isMapping = 'left';
            mapLeftBtn.textContent = TRANSLATIONS[currentLang].pressKey;
        };
    }

    if (mapRightBtn) {
        mapRightBtn.onclick = () => {
            isMapping = 'right';
            mapRightBtn.textContent = TRANSLATIONS[currentLang].pressKey;
        };
    }

    document.getElementById('btn-pt').onclick = () => {
        currentLang = 'pt';
        updateLanguageUI();
        renderShop();
        renderWorlds();
    };

    document.getElementById('btn-en').onclick = () => {
        currentLang = 'en';
        updateLanguageUI();
        renderShop();
        renderWorlds();
    };
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

    window.addEventListener('keydown', (e) => {
        if (isMapping) {
            const key = e.key.toLowerCase();
            if (isMapping === 'left') {
                leftKey = key;
                localStorage.setItem('skyJumpKeyLeft', key);
            } else {
                rightKey = key;
                localStorage.setItem('skyJumpKeyRight', key);
            }
            isMapping = null;
            updateLanguageUI();
            return;
        }
        keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => keys[e.key] = false);

    // DESATIVAÇÃO TOTAL DO MOUSE/TOUCH PARA MOVIMENTO
    const blockEvent = (e) => {
        if (gameActive) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // Bloqueia qualquer tentativa de interação com o canvas durante o jogo
    ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointermove', 'pointerup'].forEach(evt => {
        canvas.addEventListener(evt, blockEvent, { passive: false });
    });

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Iniciar loja em background
    renderShop();
});
